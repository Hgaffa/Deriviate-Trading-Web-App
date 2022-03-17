import React from "react";
import ViewtradeComponent from "./viewtradecomponent";
import axios from "axios";

//This file is for when the user looks at a trades information in either the portfolio of todays trades or the notifications tab of flagged trade alerts from ML/Backend
class Viewtrade extends React.Component {
  state = {
    visible: false,
    tradeid: this.props.tradeid,
    fetched: false,
    data: {},
    ignore: this.props.ignore,
    sensitivity: this.props.sensitivity,
    updateSens: this.props.updateSens
  };

  //Controls visibility of the modal
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

  //If the user is to click on delete trade, API requests made to delete from flagged trade list in back end (if in it) and to delete from trades in database.
  handleDelete = async e => {
    e.stopPropagation();
    await axios.delete(`http://127.0.0.1:5000/trades/badTrades/remove/${this.state.tradeid}`)
      .then( response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    await axios.delete(`http://127.0.0.1:5000/trades/delete/${this.state.tradeid}`)
      .then( response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    this.setState({ visible: false });
  };

  /// gets data for the currently clicked on trade to display in modal for more information
  getTradedata = async () => {
    await axios.get(`http://127.0.0.1:5000/trades/get/${this.state.tradeid}`)
      .then( response => {
        this.setState({data : response.data.result})
      })
      .catch(error => {
        console.log(error)
      })
  }

  //If is in notifications/alerts this method hnadles if the user clicks on ignore allert, this will remove the trade from the flagged trade list in back end and adjust the ML sensitivity by reducing it
  //as the ML has cleaerly been too sensitive to flag a good trade
  handleIgnore = async e => {
    e.stopPropagation()
    await axios.delete(`http://127.0.0.1:5000/trades/badTrades/remove/${this.state.tradeid}`)
      .then( response => {
        console.log(response.data)
      })
      .catch(error => {
        console.log(error)
      })
    await axios.get(`http://127.0.0.1:5000/trades/verificationSensitivity/set/${this.state.sensitivity - 1}`)
      .then(response => {
        console.log(response)
      })
      .catch(error => {
        console.log(error)
      })
  }

  //renders UI elements and ensures that the trade data is only fetched once, preventing an infinite API request loop on rerenders
  render(){
    if (!this.state.fetched){
      this.getTradedata();
      this.setState({ fetched : true })
    }
    return (
      <ViewtradeComponent
        showModal={this.showModal}
        handleOk={this.handleOk}
        handleCancel={this.handleCancel}
        handleEdit={this.handleEdit}
        data={this.state}
        handleDelete={this.handleDelete}
        handleIgnore={this.handleIgnore}
      />
    );
  }
}
export default Viewtrade;
