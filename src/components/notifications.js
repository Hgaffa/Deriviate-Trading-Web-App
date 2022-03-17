import React from "react";
import { Modal, Badge, Icon, Divider, Slider } from "antd";
import Alertlist from "./alertlist";
import axios from "axios";

//This file is responsible for the notifications tab that will call the alerts component to display bad trades and show the current sensitivity and allow for manual input
class Notifications extends React.Component {
  state = { visible: false, sensitivity: ""};

  //fetches current set sensitivity of ML from backend to initialise the slider.
  async componentDidMount(){
    await axios.get("http://127.0.0.1:5000/trades/verificationSensitivity/get")
      .then(response => {
        console.log(response)
        this.setState({sensitivity : response.data.result})
      })
      .catch(error => {
        console.log(error)
      })
  }

  //Similar handlers explained in other files
  showModal = e => {
    e.stopPropagation();
    this.setState({
      visible: true
    });
  };

  handleOk = e => {
    console.log(e);
    e.stopPropagation();
    this.setState({
      visible: false
    });
  };

  //Makes the notifications tab invisible when clicking off/cancelling, also logging the change in sensitivity of the ML to ensure the correct sensitivity is in place
  handleCancel = e => {
    console.log(e);
    e.stopPropagation();
    this.setState({
      visible: false
    });
    console.log(`sensitivity of ML was changed to ${this.state.sensitivity}`)
  };

  //event handler for when the sensitivity is manually changed, it will then make a post request to update the sensitivity of the ML in the back end, to keep both sides up to date.
  newSensitivity = async e => {
    var sens = e;
    if (e === 100) {
      sens=5
    } else if (e === 75){
      sens=4
    }else if (e === 50){
      sens=3
    }else if (e === 25){
      sens=2
    }else if (e === 0){
      sens=1
    }
    this.setState({
      slidervalue: e,
    })
    await axios.get(`http://127.0.0.1:5000/trades/verificationSensitivity/set/${sens}`)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  };

  //Calls the alerts component to display all flagged trades, shows adjustable sensitivity slider and controls UI of notifications tab.
  render() {
    return (
      <div onClick={this.showModal}>
        <span style={{ marginRight: 20 }}> My account </span>
        <Badge dot>
          <Icon size={32} type="bell" />
        </Badge>
        <Modal
          title="Notifications"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={null}
        >
        <Alertlist sensitivity={this.state.sensitivity}/>
          <Divider />
          <h3>Detection sensitivity</h3>
          <p>1 = least sensitive, 5 = most sensitive.</p>
          <Slider
            step={null}
            defaultValue={(this.state.sensitivity - 1) * 25}
            marks={{
              0: "1",
              25: "2",
              50: "3",
              75: "4",
              100: "5"
            }}
            tooltipVisible={false}
            onChange={this.newSensitivity}
          />
        </Modal>
      </div>
    );
  }
}
export default Notifications;
