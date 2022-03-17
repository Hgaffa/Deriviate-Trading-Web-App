import React from "react";
import { Button, Radio, Select, Spin } from "antd";
import { Row, Col } from "react-flexbox-grid";
import Dashchart from "./components/dashchart";

const { Option } = Select;

//This file contains the data maange for the dashchart and the display of ui elements on the dashboard.
class Dashboard extends React.Component {
  state = {
    disabled: true,
    loading: false,
    dataType: "",
    productlist: ["Badgers", "Focus Bands", "Red Cards"],
    stocklist: ["Tesla", "Apple", "eBay", "Alibaba"],
    currencylist: ["KYD", "CAD", "GBP"],
    options: "",
    tofetch: [],
    dofetch: [],
    data: [
      {
        id: "gbp",
        data: [
          { x: "2019-12-20", y: 11.0529 },
          { x: "2019-12-01", y: 10.7733 },
          { x: "2019-12-15", y: 10.8049 },
          { x: "2019-12-18", y: 11.0102 },
          { x: "2019-12-07", y: 11.1333 },
          { x: "2019-12-13", y: 10.8059 },
          { x: "2019-12-26", y: 11.4902 },
          { x: "2019-12-21", y: 11.0788 },
          { x: "2019-12-14", y: 10.914 },
          { x: "2019-12-19", y: 11.0208 },
          { x: "2019-12-12", y: 10.9151 },
          { x: "2019-12-06", y: 11.1311 },
          { x: "2019-12-27", y: 11.5212 },
          { x: "2019-12-03", y: 10.904 },
          { x: "2019-12-17", y: 10.8944 },
          { x: "2019-12-22", y: 11.1896 },
          { x: "2019-12-30", y: 11.4775 },
          { x: "2019-12-24", y: 11.3557 },
          { x: "2019-12-05", y: 11.1231 },
          { x: "2019-12-11", y: 10.9944 },
          { x: "2019-12-29", y: 11.5201 },
          { x: "2019-12-08", y: 11.1147 },
          { x: "2019-12-16", y: 10.9129 },
          { x: "2019-12-02", y: 10.881 },
          { x: "2019-12-23", y: 11.2976 },
          { x: "2019-12-25", y: 11.4693 },
          { x: "2019-12-31", y: 11.3627 },
          { x: "2019-12-10", y: 11.1055 },
          { x: "2019-12-04", y: 11.013 },
          { x: "2019-12-28", y: 11.406 },
          { x: "2019-12-09", y: 11.0681 }
        ]
      }
    ],
  };
  onChange = e => {
    console.log(`user has selected to display a ${e.target.value}`);
    var options = this.state.options;
    if (e.target.value == "product") {
      options = this.state.productlist.map(product => (
        <Option key={product} value={product}>
          {product}
        </Option>
      ));
      this.setState({
        options: options,
        disabled: true
      });
    } else if (e.target.value == "stock") {
      options = this.state.stocklist.map(stock => (
        <Option key={stock} value={stock}>
          {stock}
        </Option>
      ));
      this.setState({
        options: options
      });
    } else {
      options = this.state.currencylist.map(currency => (
        <Option key={currency} value={currency}>
          {currency}
        </Option>
      ));
      this.setState({
        options: options
      });
    }
    this.setState({
      disabled: false,
      dataType: e.target.value,
      placeholder: `Please select ${e.target.value}`,
      tofetch: []
    });
  };

  onSelect = e => {
    console.log(`user chosen to fetch ${e}`);
    this.setState({
      tofetch: [...this.state.tofetch, e]
    });
  };

  onFetch = () => {
    var type = this.state.dataType;
    var value = this.state.tofetch;
    console.log(`user has requested to fetch ${value}`);
    this.setState({
      toDisplay: {},
      loading: true
    });
    this.state.data.forEach(item => {
      if (item.id.toString().toLowerCase() === value.toString().toLowerCase()) {
        console.log(`Found a match with item ${item.id.toString()}`);
        console.log(`Want to display: ${JSON.stringify(this.state.toDisplay)}`);
        this.setState({ toDisplay: {} });
        this.setState({
          idFetch: item.id,
          dataFetch: item.data,
          subset: item
        });
      }
    });
    // fetch data by sending the backend ${type} and ${values}
    this.setState({ loading: false, tofetch: [] });
    // this.setState({ toDisplay: [], loading: false }); // set the data from backend
  };
  render() {
    return (
      <section style={{ textAlign: "center" }}>
        <Row around="xs">
          <Col xs={12} sm={3} lg={3}>
            <h2 style={{ marginLeft: 20, marginTop: 20 }}>Data</h2>
            <Col xs={12}>
              <Radio.Group
                buttonStyle="solid"
                name="productstockcurrency"
                size="medium"
                onChange={this.onChange}
              >
                <Radio.Button value="product">Product</Radio.Button>
                <Radio.Button value="stock">Stock</Radio.Button>
                <Radio.Button value="currency">Currency</Radio.Button>
              </Radio.Group>
            </Col>
            <Col xs={12}>
              <Select
                disabled={this.state.disabled}
                style={{ marginTop: 8, width: "70%" }}
                placeholder={this.state.placeholder}
                onChange={this.onSelect}
              >
                {this.state.options}
              </Select>
            </Col>
            <Col xs={12}>
              <Button
                style={{ marginTop: 8 }}
                loading={this.state.loading}
                onClick={this.onFetch}
              >
                Fetch data
              </Button>
            </Col>
          </Col>
          <Col xs={12} sm={9} lg={9}>
            <h2 style={{ marginLeft: 30, marginTop: 20, textAlign: "left" }}>
              {this.state.dofetch.toString()}
            </h2>
            {this.state.loading === true ? (
              <Spin />
            ) : (
              <Dashchart
                lazy={this.state.data}
              />
            )}
          </Col>
        </Row>
      </section>
    );
  }
}

export default Dashboard;
