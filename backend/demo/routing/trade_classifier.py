#!/usr/bin/env python
# coding: utf-8

import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.ensemble import IsolationForest
from joblib import dump, load

class ML_model:

    sens_convert = {1:0.25, 2:0.28, 3:0.3, 4:0.31, 5:0.32}
    model = None

    def __init__(self):
        self.model = load('model.joblib')
        self.minmax_dict = load('dict.joblib')

    def label_trade(self, quantity, current_price, strike_price, date_trade, date_expiry, trade_id):
        date_diff = date_expiry - date_trade
        date_diff_days = date_diff.days
        price_diff = int(current_price) - int(strike_price)
        quantity = (int(quantity) - self.minmax_dict['min_quantity']) / (self.minmax_dict['max_quantity'] - self.minmax_dict['min_quantity'])
        current_price = (int(current_price) - self.minmax_dict['min_price']) / (self.minmax_dict['max_price'] - self.minmax_dict['min_price'])
        strike_price = (int(strike_price) - self.minmax_dict['min_strike']) / (self.minmax_dict['max_strike'] - self.minmax_dict['min_strike'])
        date_diff = (date_diff_days - self.minmax_dict['min_date_diff']) / (self.minmax_dict['max_date_diff'] - self.minmax_dict['min_date_diff'])

        return (self.model.predict([[int(quantity), int(current_price), int(strike_price), date_diff, price_diff]])[0], trade_id)

    def adjust_sensitivity(self, sensitivity):
        self.model.set_params(contamination = self.sens_convert[sensitivity])
