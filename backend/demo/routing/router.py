from flask import Flask
from flask import jsonify
from flask import request
from flask import Response
from werkzeug.exceptions import BadRequest
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import exc
from sqlalchemy import text
from flask_cors import CORS

import time
import string
import random
import datetime
import concurrent.futures
import os
import itertools
from contextlib import suppress
from datetime import timedelta

from trade_classifier import ML_model

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///trades.db'
db = SQLAlchemy(app)
reportsDirectory = r'./reports'
sensitivity = 3
model = ML_model()
mlQueue = []
badTrades = []

class DerivativeTrade(db.Model):
    __tablename__ = "DERIVATIVE_TRADES"
    Tdate = db.Column(db.String, nullable = False)
    TradeID = db.Column(db.String(30), nullable = False, primary_key=True)
    Product = db.Column(db.String(30), nullable = False)
    BuyingParty = db.Column(db.String(6), nullable = False)
    SellingParty = db.Column(db.String(6), nullable = False)
    NotionalAmount = db.Column(db.Float, nullable = False)
    NotionalCurrency = db.Column(db.String(3), nullable = False)
    Quantity = db.Column(db.Float, nullable = False)
    MaturityDate = db.Column(db.String, nullable = False)
    UnderlyingPrice = db.Column(db.Float, nullable = False)
    UnderlyingCurrency = db.Column(db.String(3), nullable = False)
    StrikePrice = db.Column(db.Float, nullable = False)

    def __repr__(self):
        return '<Trade %r>' % self.TradeID

    def json(self):
        return {"Tdate":self.Tdate, 'TradeID':self.TradeID, 'Product':self.Product, 'BuyingParty':self.BuyingParty, 'SellingParty':self.SellingParty, 'NotionalAmount':self.NotionalAmount, 'NotionalCurrency': self.NotionalCurrency, 'Quantity':self.Quantity, 'MaturityDate':self.MaturityDate, 'UnderlyingPrice':self.UnderlyingPrice, 'UnderlyingCurrency':self.UnderlyingCurrency, 'StrikePrice':self.StrikePrice}

class CurrencyValue(db.Model):
    __tablename__ = "CURRENCY_VALUES"
    date = db.Column(db.Date, nullable = False, primary_key = True)
    Currency = db.Column(db.String(3), nullable = False, primary_key = True)
    valueInUSD = db.Column(db.Float, nullable = False)

    def __repr__(self):
        return '<CurrencyValue %r>' % (self.date + ' ' + self.Currency)

    def json(self):
        return {'Date':self.date, 'Currency':self.Currency, 'ValueInUSD':self.valueInUSD}

class ProductPrice(db.Model):
    __tablename__ = "PRODUCT_PRICES"
    date = db.Column(db.Date, nullable = False, primary_key = True)
    Product = db.Column(db.String(30), nullable = False, primary_key = True)
    MarketPrice = db.Column(db.Float, nullable = False)

    def __repr__(self):
        return '<ProductPrice %r>' % (self.date + ' ' + self.Product)

    def json(self):
        return {'Date':self.date, 'Product':self.Product, 'MarketPrice':self.MarketPrice}

class StockPrice(db.Model):
    __tablename__ = "STOCKS_PRICES"
    date = db.Column(db.Date, nullable = False, primary_key = True)
    CompanyID = db.Column(db.String(6), nullable = False, primary_key = True)
    StockPrice = db.Column(db.Float, nullable = False)

    def __repr__(self):
        return '<StockPrice %r>' % (self.date + ' ' + self.CompanyID)

    def json(self):
        return {'Date':self.date, 'CompanyID':self.CompanyID, 'StockPrice':self.StockPrice}

@app.errorhandler(404)
def pageNotFoundHandler(error):
    generatedAt = currentTime()
    return jsonify(generatedAt=generatedAt,
        statusCode=400,
        message="Bad request: Malformed URL",
        result={}), 400

@app.errorhandler(500)
def internalServerErrorHandler(error):
    generatedAt = currentTime()
    return jsonify(generatedAt=generatedAt,
        statusCode=500,
        message="Internal server error",
        result={}), 500

@app.errorhandler(405)
def methodNotAllowedHandler(error):
    generatedAt = currentTime()
    return jsonify(generatedAt=generatedAt,
        statusCode=405,
        message="Method not allowed",
        result={}), 405

@app.route("/trades/get/<tradeId>", methods=['GET'])
def getTradeById(tradeId):
    generatedAt = currentTime()
    trade = DerivativeTrade.query.filter_by(TradeID=tradeId).first()
    if trade is None:
        return jsonify(generatedAt=generatedAt,
                statusCode=404,
                message="Trade not found",
                result={}), 404
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=trade.json())

@app.route("/trades/badTrades/remove/<tradeid>", methods=['DELETE'])
def deleteBadTrade(tradeid):
    global badTrades
    generatedAt = currentTime()
    try:
        badTrades.remove(tradeid)
    except ValueError:
        return jsonify(generatedAt=generatedAt,
                statusCode=404,
                message="Trade not in bad trade list",
                result={}), 404
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result={}), 200

@app.route('/trades/create', methods=['POST'])
def createTrade():
    generatedAt = currentTime()
    try:
        jsonData = request.get_json()
        if jsonData is None:
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="Malformed JSON, or Content-Type not specified",
                    result={}), 400
        if not checkTradeKeys(jsonData):
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="One or more required parameters is missing",
                    result={}), 400
        retryCount = 0
        while True:
            try:
                tradeId = generateId()
                jsonData['TradeID'] = tradeId
                toInsert = DerivativeTrade(**jsonData)
                db.session.add(toInsert)
                db.session.commit()
            except exc.IntegrityError:
                if retryCount <= 10:
                    retryCount += 1
                    continue
                else:
                    return jsonify(generatedAt=generatedAt,
                            statusCode=500,
                            message="Unable to generate unique id for trade, or some other error occured",
                            result={}), 500
            break
        usd_prices = calculateUSDValues(jsonData['Product'], jsonData['SellingParty'], jsonData['NotionalCurrency'], jsonData['StrikePrice'], jsonData['UnderlyingCurrency'])
        with concurrent.futures.ThreadPoolExecutor() as executor:
            mlQueue.append(executor.submit(model.label_trade, jsonData['Quantity'], usd_prices['current_price_usd'], usd_prices['strike_price_usd'], datetime.datetime.strptime(jsonData['Tdate'], '%Y-%m-%d %H:%M'), datetime.datetime.strptime(jsonData['MaturityDate'], '%Y-%m-%d'), tradeId))
        return jsonify(generatedAt=generatedAt,
                statusCode=201,
                message="Created",
                result={"TradeID":tradeId}), 201
    except BadRequest:
        return jsonify(generatedAt=generatedAt,
                statusCode=400,
                message="Malformed JSON",
                result={}), 400

@app.route("/trades/getBulk/onDate/<date>", methods=['GET'])
def getTradesOnDate(date):
    time_format = datetime.datetime.strptime(date, '%Y-%m-%d')
    time_format1 = time_format.strftime('%Y-%m-%d')
    time_format2 = time_format.strftime('%Y-%m-%d')
    generatedAt = currentTime()
    trades = DerivativeTrade.query.filter(text("DATE(DERIVATIVE_TRADES_Tdate) >= DATE(\'" + time_format1 + "\') AND DATE(DERIVATIVE_TRADES_Tdate) <= DATE(\'" + time_format2 + "\') ORDER BY DERIVATIVE_TRADES_Tdate")).all()
    result = []
    for trade in trades:
        result.append(trade.json())
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/trades/getBulk/betweenDate/<after>/<before>", methods=['GET'])
def getTradesBetweenDates(after, before):
    time_format = datetime.datetime.strptime(after, '%Y-%m-%d')
    time_format1 = time_format.strftime('%Y-%m-%d') + " 00:00"
    time_format = datetime.datetime.strptime(before, '%Y-%m-%d')
    time_format2 = time_format.strftime('%Y-%m-%d') + " 11:59:59.999"
    generatedAt = currentTime()
    trades = DerivativeTrade.query.filter(text("DATE(DERIVATIVE_TRADES_Tdate) >= DATE(\'" + time_format1 + "\') AND DATE(DERIVATIVE_TRADES_Tdate) <= DATE(\'" + time_format2 + "\') ORDER BY DERIVATIVE_TRADES_Tdate")).all()
    result = []
    for trade in trades:
        result.append(trade.json())
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/trades/buyingList", methods=['GET'])
def getBuyingPartyList():
    generatedAt = currentTime()
    tradeList = DerivativeTrade.query.with_entities(DerivativeTrade.BuyingParty).distinct().order_by(DerivativeTrade.BuyingParty).all()
    result = []
    for trade in tradeList:
        result.append(trade.BuyingParty)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/trades/sellingList", methods=['GET'])
def getSellingPartyList():
    generatedAt = currentTime()
    tradeList = DerivativeTrade.query.with_entities(DerivativeTrade.SellingParty).distinct().order_by(DerivativeTrade.SellingParty).all()
    result = []
    for trade in tradeList:
        result.append(trade.SellingParty)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/trades/verificationSensitivity/get", methods=['GET'])
def getVerificaitonLevel():
    global sensitivity
    generatedAt = currentTime()
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=sensitivity), 200

@app.route("/trades/verificationSensitivity/set/<level>", methods=['GET'])
def setVerificationLevel(level):
    global sensitivity
    generatedAt = currentTime()
    try:
        toSet = int(level)
    except ValueError:
        return jsonify(generatedAt=generatedAt,
                statusCode=400,
                message="Invalid level",
                result={}), 400
    sensitivity = toSet
    model.adjust_sensitivity(sensitivity)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result={}), 200

@app.route("/trades/badTrades/list", methods=['GET'])
def getBadTradeList():
    global mlQueue
    for future in mlQueue:
        future_result = future.result()
        if future_result[0] == -1:
            addBadTrade(future_result[1])
    mlQueue=[]
    generatedAt = currentTime()
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=badTrades)

@app.route("/currency/getBulk/<currency>/betweenDate/<after>/<before>", methods=['GET'])
def getCurrencyBetweenDate(currency, after, before):
    time_format = datetime.datetime.strptime(after, '%Y-%m-%d')
    time_format1 = time_format.strftime('%Y-%m-%d') + " 00:00"
    time_format = datetime.datetime.strptime(before, '%Y-%m-%d')
    time_format2 = time_format.strftime('%Y-%m-%d') + " 11:59:59.999"
    generatedAt = currentTime()
    currencies = CurrencyValue.query.filter(text("DATE(CURRENCY_VALUES_date) >= DATE(\'" + time_format1 + "\') AND DATE(CURRENCY_VALUES_date) <= DATE(\'" + time_format2 + "\') AND CURRENCY_VALUES_Currency = \'" + currency + "\' ORDER BY CURRENCY_VALUES_date")).all()
    result = []
    for currency in currencies:
        result.append(currency.json())
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/currency/list", methods=['GET'])
def getCurrencyList():
    generatedAt = currentTime()
    currencyList = CurrencyValue.query.with_entities(CurrencyValue.Currency).distinct().order_by(CurrencyValue.Currency).all()
    result = []
    for currency in currencyList:
        result.append(currency.Currency)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/product/getBulk/<product>/betweenDate/<after>/<before>", methods=['GET'])
def getProductPriceBetweenDate(product, after, before):
    product.replace("_", " ")
    time_format = datetime.datetime.strptime(after, '%Y-%m-%d')
    time_format1 = time_format.strftime('%Y-%m-%d') + " 00:00"
    time_format = datetime.datetime.strptime(before, '%Y-%m-%d')
    time_format2 = time_format.strftime('%Y-%m-%d') + " 11:59:59.999"
    generatedAt = currentTime()
    products = ProductPrice.query.filter(text("DATE(PRODUCT_PRICES_date) >= DATE(\'" + time_format1 + "\') AND DATE(PRODUCT_PRICES_date) <= DATE(\'" + time_format2 + "\') AND PRODUCT_PRICES_Product = \'" + product + "\' ORDER BY PRODUCT_PRICES_date")).all()
    result = []
    for product in products:
        result.append(product.json())
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/product/list", methods=['GET'])
def getProductList():
    generatedAt = currentTime()
    productList = ProductPrice.query.with_entities(ProductPrice.Product).distinct().order_by(ProductPrice.Product).all()
    result = []
    for product in productList:
        result.append(product.Product)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/stock/getBulk/<companyid>/betweenDate/<after>/<before>", methods=['GET'])
def getStockPriceBetweenDate(companyid, after, before):
    time_format = datetime.datetime.strptime(after, '%Y-%m-%d')
    time_format1 = time_format.strftime('%Y-%m-%d') + " 00:00"
    time_format = datetime.datetime.strptime(before, '%Y-%m-%d')
    time_format2 = time_format.strftime('%Y-%m-%d') + " 11:59:59.999"
    generatedAt = currentTime()
    stockprices = StockPrice.query.filter(text("DATE(STOCKS_PRICES_date) >= DATE(\'" + time_format1 + "\') AND DATE(STOCKS_PRICES_date) <= DATE(\'" + time_format2 + "\') AND STOCKS_PRICES_CompanyID = \'" + companyid + "\' ORDER BY STOCKS_PRICES_date")).all()
    result = []
    for stockprice in stockprices:
        result.append(stockprice.json())
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

@app.route("/company/list", methods=['GET'])
def getCompanyList():
    generatedAt = currentTime()
    companyList = StockPrice.query.with_entities(StockPrice.CompanyID).distinct().order_by(StockPrice.CompanyID).all()
    result = []
    for company in companyList:
        result.append(company.CompanyID)
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="OK",
            result=result)

# @app.route("/trades/getBulk/lastDay", methods=['GET'])
# def getTradesFromPastDay():
#     generatedAt = currentTime()
#     trades = DerivativeTrade.query.filter(text("DATE(substr(DERIVATIVE_TRADES_Tdate,7,4)||'-'||substr(DERIVATIVE_TRADES_Tdate,4,2)||'-'||substr(DERIVATIVE_TRADES_Tdate,1,2)||' '||substr(DERIVATIVE_TRADES_Tdate,12)) BETWEEN DATE('" + (datetime.datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M") + "') AND ('" + datetime.datetime.now().strftime("%Y-%m-%d %H:%M") + "')")).all()
#     result = []
#     for trade in trades:
#         result.append(trade.json())
#     return jsonify(generatedAt=generatedAt,
#             statusCode=200,
#             message="OK",
#             result=result)

@app.route("/trades/edit/<tradeid>", methods=['PUT'])
def editTrade(tradeid):
    generatedAt = currentTime()
    trade = DerivativeTrade.query.filter_by(TradeID=tradeid).first()
    if trade is None:
        return jsonify(generatedAt=generatedAt,
                statusCode=404,
                message="Trade not found",
                result={}), 404
    try:
        jsonData = request.get_json()
        if jsonData is None:
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="Malformed JSON, or Content-Type not specified",
                    result={}), 400
        if not checkTradeKeys(jsonData):
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="One or more required parameters is missing",
                    result={}), 400
        retryCount = 0
    except BadRequest:
        return jsonify(generatedAt=generatedAt,
                statusCode=400,
                message="Malformed JSON",
                result={}), 400
    trade.Tdate = jsonData['Tdate']
    trade.Product = jsonData['Product']
    trade.BuyingParty = jsonData['BuyingParty']
    trade.SellingParty = jsonData['SellingParty']
    trade.NotionalAmount = jsonData['NotionalAmount']
    trade.NotionalCurrency = jsonData['NotionalCurrency']
    trade.Quantity = jsonData['Quantity']
    trade.MaturityDate = jsonData['MaturityDate']
    trade.UnderlyingPrice = jsonData['UnderlyingPrice']
    trade.UnderlyingCurrency = jsonData['UnderlyingCurrency']
    trade.StrikePrice = jsonData['StrikePrice']
    db.session.commit()
    usd_prices = calculateUSDValues(jsonData['Product'], jsonData['SellingParty'], jsonData['NotionalCurrency'], jsonData['StrikePrice'], jsonData['UnderlyingCurrency'])
    with concurrent.futures.ThreadPoolExecutor() as executor:
        mlQueue.append(executor.submit(model.label_trade, jsonData['Quantity'], usd_prices['current_price_usd'], usd_prices['strike_price_usd'], datetime.datetime.strptime(jsonData['Tdate'], '%Y-%m-%d %H:%M'), datetime.datetime.strptime(jsonData['MaturityDate'], '%Y-%m-%d'), tradeid))
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="Trade updated successfully",
            result={}), 200

@app.route("/trades/verify", methods=['POST'])
def verifyTrade():
    generatedAt = currentTime()
    try:
        jsonData = request.get_json()
        if jsonData is None:
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="Malformed JSON, or Content-Type not specified",
                    result={}), 400
        if not checkVerificationKeys(jsonData):
            return jsonify(generatedAt=generatedAt,
                    statusCode=400,
                    message="One or more required parameters is missing",
                    result={}), 400
        result = calculateVerification(jsonData['quantity'], jsonData['sellingParty'], jsonData['productName'], jsonData['notionalCurrency'], jsonData['strikePrice'])
        return jsonify(generatedAt=generatedAt,
                statusCode=200,
                message="OK",
                result=result), 200
    except BadRequest:
        return jsonify(generatedAt=generatedAt,
                statusCode=400,
                message="Malformed JSON",
                result={}), 400

@app.route("/trades/delete/<tradeid>", methods=['DELETE'])
def deleteTrade(tradeid):
    generatedAt = currentTime()
    trade = DerivativeTrade.query.filter_by(TradeID=tradeid).first()
    if trade is None:
        return jsonify(generatedAt=generatedAt,
                statusCode=404,
                message="Trade not found",
                result={}), 404
    DerivativeTrade.query.filter_by(TradeID=tradeid).delete()
    db.session.commit()
    return jsonify(generatedAt=generatedAt,
            statusCode=200,
            message="Trade deleted successfully",
            result={}), 200


@app.route("/trades/reports/cache/<date>")
def getCachedReport(date):
    generatedAt = currentTime()
    generateCachedReports()
    newDate = date.replace("-", "")
    if not os.path.exists(reportsDirectory + "/" + newDate + ".json"):
        return jsonify(generatedAt=generatedAt,
                statusCode=404,
                message="That report is not cached",
                result={}), 404
    with open(reportsDirectory + "/" + newDate + ".json", "r") as cacheFile:
        result = cacheFile.read().replace("\n", "")
        return Response(result, 200, mimetype='application/json')

def currentTime():
    return round(time.time())

def getToday():
    return datetime.datetime(2020, 1, 1, datetime.datetime.now().hour, datetime.datetime.now().minute, datetime.datetime.now().second, datetime.datetime.now().microsecond)

def checkTradeKeys(data):
    return "Tdate" in data and "Product" in data and "BuyingParty" in data and "SellingParty" in data and "NotionalCurrency" in data and "NotionalAmount" in data and "Quantity" in data and "MaturityDate" in data and "UnderlyingPrice" in data and "UnderlyingCurrency" in data and "StrikePrice" in data

def checkVerificationKeys(data):
    return "quantity" in data and "sellingParty" in data and "productName" in data and "notionalCurrency" in data and "strikePrice" in data

def generateId():
    letters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(letters) for i in range(16))

def generateCachedReports():
    currentreports = getCurrentReportNames()
    for filename in os.listdir(reportsDirectory):
        if not filename in currentreports:
            # TODO: File seperator issue?
            os.remove(reportsDirectory + "/" + filename)
        else:
            currentreports.remove(filename)
    for reportname in currentreports:
        tradesResponse = getTradesOnDate(reportname[0:4] + '-' + reportname[4:6] + '-' + reportname[6:8])
        with open(reportsDirectory + "/" + reportname, "wt") as report:
            print(tradesResponse.data.decode('ASCII'), file=report)

def getCurrentReportNames():
    today = getToday()
    result = []
    for _ in itertools.repeat(None, 7):
        today = today - timedelta(days=1)
        result.append(str(today.year) + str(today.month) + str(today.day) + '.json')
    return result

def addBadTrade(tradeId):
    badTrades.append(tradeId)

def calculateVerification(quantity, selling_party, product_name, notional_currency, strike_price):
    currency_conversion_notional_query = CurrencyValue.query.filter_by(Currency=notional_currency).order_by(CurrencyValue.date.desc()).first()
    currency_conversion_notional = currency_conversion_notional_query.valueInUSD
    if product_name == "Stocks":
        stock_price = StockPrice.query.filter_by(CompanyID=selling_party).order_by(StockPrice.date.desc()).first()
        current_price_usd = stock_price.StockPrice
        current_price = current_price_usd * currency_conversion_notional
        notional_value = current_price * int(quantity)
        market_value = int(strike_price) * int(quantity)
        return {'currentPrice': current_price, 'notionalValue': notional_value, 'marketValue': market_value}
    else:
        product_price = ProductPrice.query.filter_by(Product=product_name).order_by(ProductPrice.date.desc()).first()
        current_price_usd = product_price.MarketPrice
        current_price = current_price_usd * currency_conversion_notional
        notional_value = current_price * int(quantity)
        market_value = int(strike_price) * int(quantity)
        return {'currentPrice': current_price, 'notionalValue': notional_value, 'marketValue': market_value}

def calculateUSDValues(product_name, selling_party, notional_currency, strike_price, underlying_currency):
    currency_conversion_notional_query = CurrencyValue.query.filter_by(Currency=notional_currency).order_by(CurrencyValue.date.desc()).first()
    currency_conversion_notional = currency_conversion_notional_query.valueInUSD
    currency_conversion_underlying_query = CurrencyValue.query.filter_by(Currency=underlying_currency).order_by(CurrencyValue.date.desc()).first()
    currency_conversion_underlying = currency_conversion_underlying_query.valueInUSD
    strike_price_usd = int(strike_price) * int(currency_conversion_underlying)
    if product_name == "Stocks":
        stock_price = StockPrice.query.filter_by(CompanyID=selling_party).order_by(StockPrice.date.desc()).first()
        current_price_usd = stock_price.StockPrice
        return {'current_price_usd': current_price_usd, 'strike_price_usd': strike_price_usd}
    else:
        product_price = ProductPrice.query.filter_by(Product=product_name).order_by(ProductPrice.date.desc()).first()
        current_price_usd = product_price.MarketPrice
        return {'current_price_usd': current_price_usd, 'strike_price_usd': strike_price_usd}

if __name__ == "__main__":
    if not os.path.exists(reportsDirectory):
        os.makedirs(reportsDirectory)
    app.run()
