import React from "react";
import { List, Table, Icon, Button, DatePicker } from "antd";
import Moment from "moment"
import ReportPDF from "./components/reportpdf";
import { Link } from "react-router-dom";

const { RangePicker } = DatePicker;
//This file is responsible for calling all child components and handling UI elements on reports page (is the parent component)
class Reports extends React.Component {
  state = {
    list: [],
    datePicked: ""
  };

  //These two methods generate the dates of the past 7 days for a loaded past 7 day report generation
  getDayBefore = (d) =>{
    var date = new Date(d)
    date.setDate(date.getDate() - 1);
    return Moment(date).format('YYYY-MM-DD')
  }
  componentDidMount(){
    var d1 = "2020-01-01"
    var d2 = this.getDayBefore(d1)
    var d3 = this.getDayBefore(d2)
    var d4 = this.getDayBefore(d3)
    var d5 = this.getDayBefore(d4)
    var d6 = this.getDayBefore(d5)
    var d7 = this.getDayBefore(d6)
    this.setState({list : [d1,d2,d3,d4,d5,d6,d7]})
  }
  //Event handler to store string of two dates for betweeen date report generations
  onChange = (date, dateString) => {
    this.setState({ datePicked : dateString })
  };
  handleGenerateRange = e => {
    console.log(`Generate pdf for range ${this.state.dateString}`);
  };
  //Renders UI elements, allows the user to press generate to generate reports for a chosen date or range of dates or choose from last 7 dates.
  render() {
    return (
      <>
        <section style={{ margin: 20 }}>
          <h2>Generate reports:</h2>
          <span>Generate report of all trades made today: </span>
          <Link
            to={{pathname: `/pdf/2020-01-01`, state: {datePicked: ""}}}
          >
            <Button
              htmlType="submit"
              style={{ marginLeft: 8 }}
              type="primary"
            >
              Generate
            </Button>
          </Link>
          <br />
          <br />
          Generate report between specific dates:{" "}
          <RangePicker style={{ marginLeft: 8 }} onChange={this.onChange} />
          <Link
            to={{pathname: `/pdf/${this.state.datePicked}`, state: {datePicked: this.state.datePicked}}}
          >
            <Button
              style={{ marginLeft: 8 }}
              type="primary"
              onClick={this.handleGenerateRange}
            >
              Generate
            </Button>
          </Link>
          <h1 style={{ textAlign: "left" }}>Previous Reports</h1>
          <List
            itemLayout="vertical"
            dataSource={this.state.list}
            renderItem={item => <List.Item extra={<ReportPDF date={item}/>}>{item}</List.Item>}
          />
        </section>
      </>
    );
  }
}

export default Reports;
