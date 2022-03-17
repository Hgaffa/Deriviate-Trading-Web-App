import React from "react";
import axios from "axios";
import moment from "moment"
import { Typography, Button, Table, Tag } from "antd";
const { Title } = Typography;

//This file generates thee reports for chosen dates in the reports page.
class ReportGenerate extends React.Component {
  state = {
    date: this.props.match.params.date,
    now: new Date(),
    data: [],
    datePicked: this.props.location.state.datePicked
  }

  //Function to add tag property to fetcheed data to show whether trades or Active/Inactive
  addTags(){
    let data = this.state.data.map((e) => {
      e.Tags = (moment(e.MaturityDate, "YYYY-MM-DD") < moment("2020-01-01", "YYYY-MM-DD")) ? ["Inactive"] : ["Active"]
      return e
    })
    this.setState({ data : data})
  }

  //Fetches all trades on the chosen data or all data betweeeen two dates if an inteerval was chosen
  async componentDidMount() {
    if (this.state.datePicked == ""){
      axios.get(`http://127.0.0.1:5000/trades/getBulk/onDate/${this.state.date}`)
        .then( response => {
          this.setState({data : response.data.result},
          () => {
            this.addTags();
          })
          console.log(response.data.result)
        })
        .catch(error => {
          console.log(error)
        })
    } else {
      this.setState({ date: this.state.datePicked[0] + " - " + this.state.datePicked[1]})
      await axios.get(`http://127.0.0.1:5000/trades/getBulk/betweenDate/${this.state.datePicked[0]}/${this.state.datePicked[1]}`)
        .then( response => {
          this.setState({data : response.data.result})
          console.log(response.data.result)
        })
        .catch(error => {
          console.log(error)
        })
    }
    console.log(`get report for date ${this.state.data}`);
  }
  //Creates columns for the table and displays them
  render() {
    const columns = [
      {
        title: "Trade ID",
        dataIndex: "TradeID",
        key: "TradeID"
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
        key: "StrikePrice"
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
      },
      {
        title: "Active/Inactive",
        key: "Tags",
        dataIndex: "Tags"
      }
    ];
    return (
      <section style={{ margin: 20 }}>
        <Title>{`Trade report for ${this.state.date}`}</Title>
        {"Report generated on "}
        {this.state.now.toLocaleDateString("zh-CN")}
        {" at "}
        {this.state.now.toLocaleTimeString()}
        <Table dataSource={this.state.data} columns={columns} rowKey='TradeID' />
      </section>
    );
  }
}

export default ReportGenerate;
