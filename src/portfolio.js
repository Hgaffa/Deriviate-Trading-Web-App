import React from "react";
import { Table } from "antd";
import axios from "axios";

import Viewtrade from "./components/viewtrade";
//This file is responsible for showing all of todays trades in the portfolio page

class Portfolio extends React.Component {
  state = {
    data: [],
    sensitivity: "",
    //columns for table data, calls trade components when clicking on trade id to see more information and possible actions
    columns: [
      {
        title: "Trade ID",
        dataIndex: "TradeID",
        key: "TradeID",
        render: text => (
          <Viewtrade
            tradeid={text}
            ignore={false}
            sensitivity={this.state.sensitivity}
            updateSens={true}
          />
        )
      },
      {
        title: "Buying party",
        dataIndex: "BuyingParty",
        key: "BuyingParty"
      },
      {
        title: "Selling party",
        dataIndex: "SellingParty",
        key: "SellingParty"
      },
      {
        title: "Product",
        dataIndex: "Product",
        key: "Product"
      },
      {
        title: "Quantity",
        dataIndex: "Quantity",
        key: "Quantity"
      },
      {
        title: "Notional currency",
        dataIndex: "NotionalCurrency",
        key: "NotionalCurrency"
      },
      {
        title: "Underlying currency",
        dataIndex: "UnderlyingCurrency",
        key: "UnderlyingCurrency"
      },
      {
        title: "Strike price",
        dataIndex: "StrikePrice",
        key: "StrikePrice",
      },
      {
        title: "Notional Amount",
        dataIndex: "NotionalAmount",
        key: "NotionalAmount"
      },
      {
        title: "Expiry date",
        dataIndex: "MaturityDate",
        key: "MaturityDate"
      },
      {
        title: "Trade date",
        dataIndex: "Tdate",
        key: "Tdate"
      },
      {
        title: "Underlying Price",
        dataIndex: "UnderlyingPrice",
        key: "UnderlyingPrice"
      }
    ]
  };

  //On mount gets the trades from today and the sensitivity of the ML for lateer adjustment if trades are edited
  componentDidMount(){
     axios.get(`http://127.0.0.1:5000/trades/getBulk/onDate/2020-01-01`)
      .then( response => {
        this.setState({data : response.data.result})
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
     axios.get("http://127.0.0.1:5000/trades/verificationSensitivity/get")
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
    this.setState({
      visible: false
    });
  };

  handleCancel = e => {
    e.stopPropagation();
    this.setState({
      visible: false
    });
  };

  handleEdit = e => {
    e.stopPropagation();
    console.log(`Requesting to edit trade ${this.state.tradeid}`);
    // Take to the edit trade form for this trade id
    this.setState({
      visible: false
    });
  };

  handleDelete = e => {
    e.stopPropagation();
    console.log(`Requesting to delete trade ${this.state.tradeid}`);
    this.setState({ visible: false });
  };

  //renders table
  render() {
    return (
      <>
        <section style={{ margin: 20 }}>
          <h1 style={{ textAlign: "left" }}>Portfolio</h1>
          <h2>Trades today:</h2>
          <Table dataSource={this.state.data} columns={this.state.columns} rowKey="TradeID" />
        </section>
      </>
    );
  }
}

export default Portfolio;
