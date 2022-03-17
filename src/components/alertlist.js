import React from "react";
import { Card, Button } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import Viewtrade from "./viewtrade";
import axios from "axios";
//Specific antd elements imported

class Alertlist extends React.Component {
  state = {
    errorTrades: [],
    sensitivity: this.props.sensitivity
  };

  //API get request to get the list of trades that have been flagged by machine learning from backend. This will be dispalyed as alerts.
  async componentDidMount(){
      await axios.get("http://127.0.0.1:5000/trades/badTrades/list")
        .then(response => {
          this.setState({ errorTrades : response.data.result})
          console.log(response.data)
        })
        .catch(error => {
          console.log(error)
        })
  }

  //This displays the flagged trades as alerts in the notificatications screen. Each trade will have its only clickable link on its tradeid which will call the viewtrade componenet to view the trades information
  //and available actions.
  render() {
    return (
      <div>
        {this.state.errorTrades.map(trade => (
          <Card
            style={{
              marginTop: 8,
              background: "#fffbe6",
              outline: "#ffe58f solid 1px"
            }}
            key={trade}
            bordered={false}
            size="small"
            type="warning"
            showIcon
          >
            <WarningOutlined style={{ color: "#faad14" }} />
            {<span style={{ marginLeft: 8 }}>Error detected for trade </span>}
            <Viewtrade tradeid={trade} ignore={true} sensitivity={this.state.sensitivity} updateSens={false}/>
          </Card>
        ))}
      </div>
    );
  }
}
export default Alertlist;
