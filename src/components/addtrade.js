import React from "react";
import axios from "axios";
//Axios used for api requests

import AddtradeComponent from "./addtradeComponent";

class Addtrade extends React.Component {
  state = { //State holds all data that needs to be saved/altered or passed as props to child components
    tradeId: "",
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

  //This is an example of a lifecycle method. This method will only be called once, when the component is "mounted"/first rendered
  //Here API requests are made to retreive the list of companies, products and currencies from the database to be chosen when adding a new trade
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
  }

  //Modal event handlers to control when to show and hide the add form modal component
  showModal = e => {
    e.stopPropagation();
    this.setState({
      visible: true
    });
  };

  //Event handler for when user clicks OK from modal component, this will make it invisible
  //Set state is used to update values of variables held locally in state, as previously explained.
  handleOk = e => {
    e.stopPropagation();
    console.log(e);
    this.setState({
      visible: false
    });
  };

  //Event handler for when the user cancels from the modal, this will make it invisible
  handleCancel = e => {
    e.stopPropagation();
    console.log(e);
    this.setState({
      visible: false
    });
  };

  //enableField and disableField are used when the user chooses to add a Product or a Stock, by choosing a product, the choice of choosing a product name will be available
  //when choosing a stock, this dropdown will be disabled.
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

  //Most of the below event handlers enforce a basic level of data validation and error detection to remove complexity from back end data processing.
  //Event handler for when a number is inputted into the form. This updates relevant state values and ensures that the quentity and strike price aree number inputs, otherwise displays an apporopriate error message
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

  //Event handler for the buyers list, this is to make sure that the chosen buyeer is not the same as the selling party, otherwise an appropriate message is displayed.
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

  //Similar to previous handler, makes sure that the selling party is not the same as the buying party (must be done two ways to ensure all logic is accounted for)
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

  //Handler for the notional value as the antd dropdown element does not return an orthodox object on onChange events, this is why there are very similar event handlers for each antd element.
  handleNotional = v => {
    console.log(console.log(`selected notional ${v}`));
    this.setState(prevState => ({
      ...prevState,
      notionalCurrency: {
        value: v
      }
    }));
  };

  //Event handler for dropdowns
  handleDropdown = val => {
    this.setState(prevState => ({
      ...prevState,
      productName: {
        value: val
      }
    }));
  };

  //Event handler for underlying currency to update the state varaibles
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

  //Event handler for maturity date to update the state varaibles
  handleExpirydate = (d, ds) => {
    this.setState(prevState => ({
      ...prevState,
      expiryDate: {
        value: ds
      }
    }));
  };

  //checks whether the user has chosen a stock or a product, if it is a stock then the product name become "stocks" to match parameters required for the backend
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


  //Event handlers for when the user verifies his trade from quantity, product namee and strike price inputs. This will check if it is a product/stock and prepare the data
  //to be verfied by loading into a state object that will be passeed in a post api request. getVerify does this throug the use of axios and sends of the data to be verified by the backend and
  //returning a calculated market value, notional amount and current price.
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

  //event handler wheen the user submits the add trade form. It prepares the data to be passed as a post request to the back end to create a new entry into the sql database
  handleSubmit = async () => {
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
      .post("http://127.0.0.1:5000/trades/create", this.state.createTradedata)
      .then(response => {
        console.log(response.data.result.TradeID)
        this.setState({ [this.state.tradeId] : response.data.result.TradeID})
      })
      .catch(error => {
        console.log("ERROR: =============", error.response)
    })
  }

  //Renders the addtradeComponent which contains all of JSX needs for displaying the UI elements and setting up event handler calls.
  render() {
    return (
      <AddtradeComponent
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
        handleVerify={this.getVerify}
        enableField={this.enableField}
        disableField={this.disableField}
        data={this.state}
        handleSubmit={this.handleSubmit}
      />
    );
  }
}
export default Addtrade;
