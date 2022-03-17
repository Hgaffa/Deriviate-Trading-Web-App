import React from "react";
import EdittradeComponent from "./edittradeComponent";
import axios from "axios";

//This file is used for editing a trade either through the portfolio of todays trades or through the flagged bad trades on the notifactions tab,
//It functions almost identically to addtrade.js so refer to the documentation in addtrade.js
class Edittrade extends React.Component {
  state = {
    tradeId: this.props.data,
    sensitivity: this.props.sensitivity,
    updateSens: this.props.updateSens,
    createTradedata: {
      BuyingParty: "",
      SellingParty: "",
      ProductName: "",
      Quantity: "",
      NotionalCurrency: "",
      UnderlyingCurrency: "",
      StrikePrice: "",
      MaturityDate: "",
      Tdate: "",
      NotionalAmount: "",
      UnderlyingPrice: ""
    },
    disabled: false,
    visible: false,
    buyingParty: {
      value: "",
      valid: "",
      help: ""
    },
    sellingParty: {
      value: "",
      valid: "",
      help: ""
    },
    productStock: {
      value: "",
      valid: "",
      help: ""
    },
    productName: {
      value: ""
    },
    quantity: {
      value: "",
      valid: "",
      help: ""
    },
    notionalCurrency: {
      value: ""
    },
    underlyingCurrency: {
      value: ""
    },
    strikePrice: {
      value: "",
      valid: "",
      help: ""
    },
    expiryDate: {
      value: ""
    },
    currencyList: [],
    productList: [],
    companyList: [],
    isVerified: false,
    verifiedData: {
      marketValue: "",
      notionalValue: "",
      currentValue: ""
    },
    verifyData: {
      quantity: "",
      sellingParty: "",
      productName: "",
      notionalCurrency: "",
      strikePrice: ""
    }
  };

  //Main differenc of mounting of this component is that the sensitivity of the ML algorithm is fetched from the backend via API get request and is loaded into a state variables.
  //this is because in edit trade, if the user is to edit a trade through the portfolio page, it will increase the sensitivity of the ML algorithm as it has clearly missed a user error input.
  async componentDidMount(){
    await axios.get("http://127.0.0.1:5000/company/list")
      .then(response => {
        this.setState({companyList : response.data.result})
        console.log(this.state.companyList)
      })
      .catch(error => {
        console.log(error)
      })
    await axios.get("http://127.0.0.1:5000/product/list")
      .then(response => {
        this.setState({productList : response.data.result})
        console.log(this.state.productList)
      })
      .catch(error => {
        console.log(error)
      })
    await axios.get("http://127.0.0.1:5000/currency/list")
      .then(response => {
        this.setState({currencyList : response.data.result})
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    await axios.get("http://127.0.0.1:5000/trades/verificationSensitivity/get")
      .then(response => {
        console.log(response)
        this.setState({sensitivity : response.data.result})
      })
      .catch(error => {
        console.log(error)
      })
  }

  showModal = e => {
    e.stopPropagation();
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    e.stopPropagation();
    console.log(e);
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    e.stopPropagation();
    console.log(e);
    this.setState({
      visible: false
    });
  };

  enableField = () => {
    this.setState({
      disabled: false
    });
  };

  disableField = () => {
    this.setState({
      disabled: true
    });
  };
  handleNumber = event => {
    event.preventDefault();
    const { name, value } = event.target;
    var validator = "validating";
    var helpMsg = "";
    console.log(`handling ${name} set to ${value}`);
    if (name === "quantity" || name === "strikePrice") {
      if (!Number(value) & (value !== "") || Number(value) < 0) {
        validator = "error";
        helpMsg =
          name === "quantity"
            ? "Enter a valid quantity"
            : "Enter a valid strike price";
      }
    }
    this.setState(prevState => ({
      // must take into account previous state as is an object with changing properties
      ...prevState, //Spread notation means to copy all same properties of previous states object "errors"
      [name]: {
        value: value,
        valid: validator,
        help: helpMsg
      }
    }));
  };
  handleBuyer = value => {
    var validator = "";
    var helpMsg = "";
    console.log(
      `Checking if ${value} is equal to ${this.state.sellingParty.value}`
    );
    if (value == this.state.sellingParty.value) {
      validator = "error";
      helpMsg = "Enter a valid buyer";
    }
    this.setState(prevState => ({
      ...prevState,
      buyingParty: {
        value: value,
        valid: validator,
        help: helpMsg
      }
    }));
  };
  handleSeller = value => {
    var validator = "";
    var helpMsg = "";
    console.log(
      `Checking if ${value} is equal to ${this.state.buyingParty.value}`
    );
    if (value == this.state.buyingParty.value) {
      validator = "error";
      helpMsg = "Enter a valid seller";
    }
    this.setState(prevState => ({
      ...prevState,
      sellingParty: {
        value: value,
        valid: validator,
        help: helpMsg
      }
    }));
  };

  handleNotional = v => {
    console.log(console.log(`selected notional ${v}`));
    this.setState(prevState => ({
      ...prevState,
      notionalCurrency: {
        value: v
      }
    }));
  };

  handleDropdown = val => {
    this.setState(prevState => ({
      ...prevState,
      productName: {
        value: val
      }
    }));
  };

  handleUnderlying = v => {
    console.log(console.log(`selected underlying ${v}`));
    this.setState(prevState => ({
      ...prevState,
      underlyingCurrency: {
        value: v,
        valid: "",
        help: ""
      }
    }));
  };

  handleExpirydate = (d, ds) => {
    this.setState(prevState => ({
      ...prevState,
      expiryDate: {
        value: ds
      }
    }));
  };

  isStock = () => {
    if(this.state.productStock.value === "Stocks"){
      this.setState(prevState => ({
          ...prevState,
          productName: {
            value: "Stocks"
          }
      }))
    }
  }

  handleVerify = () => {
    this.isStock()
    this.setState(prevState => ({
        ...prevState,
        verifyData: {
          quantity: this.state.quantity.value,
          sellingParty: this.state.sellingParty.value,
          productName: this.state.productName.value,
          notionalCurrency: this.state.notionalCurrency.value,
          strikePrice: this.state.strikePrice.value
        }
    }))
  };

  getVerify = async () =>{
    await this.handleVerify();
    const options = {
      headers: {
        'Content-Type': 'application/json',
      }
    };
    await axios
      .post("http://127.0.0.1:5000/trades/verify", this.state.verifyData)
      .then(response => {
        console.log(response.data.result)
        this.setState(prevState => ({
            ...prevState,
            verifiedData: {
              marketValue: response.data.result.marketValue,
              notionalValue: response.data.result.notionalValue,
              currentValue: response.data.result.currentPrice
            }
        }))
      })
      .catch(error => {
        console.log("ERROR: =============", error.response)
    })
    this.setState({isVerified : true})
  }

  //On submit of any trade edit, this removes the tradeid of the tradee from the list of bad trades (if in it) in the back end to remove it from the alerts tab
  //this is because the trade is then submitted and passed again through the ML, if it is still bad it will reappear in the alerts list.
  handleSubmit = async () => {
    await axios.delete(`http://127.0.0.1:5000/trades/badTrades/remove/${this.state.tradeId}`)
      .then( response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    this.isStock()
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var currtime = "2020-01-01 " + h + ":" + m
    await this.setState(prevState => ({
        ...prevState,
        createTradedata: {
          BuyingParty: this.state.buyingParty.value,
          SellingParty: this.state.sellingParty.value,
          Product: this.state.productName.value,
          Quantity: this.state.quantity.value,
          NotionalCurrency: this.state.notionalCurrency.value,
          UnderlyingCurrency: this.state.underlyingCurrency.value,
          StrikePrice: this.state.strikePrice.value,
          MaturityDate: this.state.expiryDate.value,
          Tdate: currtime,
          NotionalAmount: this.state.verifiedData.notionalValue,
          UnderlyingPrice: this.state.verifiedData.marketValue
        }
    }))
    axios
      .put(`http://127.0.0.1:5000/trades/edit/${this.state.tradeId}`, this.state.createTradedata)
      .then(response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log("ERROR: =============", error.response)
    })
    //This checks if the trade edit is via the portfolio page, if so then the sensitivity of the ML can be increased.
    if (window.location.pathname == "/portfolio"){
      axios.get(`http://127.0.0.1:5000/trades/verificationSensitivity/set/${this.state.sensitivity + 1}`)
        .then(response => {
          console.log(response)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  //Calls child component
  render() {
    return (
      <EdittradeComponent
        showModal={this.showModal}
        handleOk={this.handleOk}
        handleCancel={this.handleCancel}
        handleNotional={this.handleNotional}
        handleNumber={this.handleNumber}
        handleBuyer={this.handleBuyer}
        handleSeller={this.handleSeller}
        handleUnderlying={this.handleUnderlying}
        handleDropdown={this.handleDropdown}
        handleExpirydate={this.handleExpirydate}
        handleExpirytime={this.handleExpirytime}
        handleVerify={this.getVerify}
        enableField={this.enableField}
        disableField={this.disableField}
        data={this.state}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}
export default Edittrade;
