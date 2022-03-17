import React from "react";
import axios from "axios";
import { Typography, Button, Table, Tag } from "antd";
import ReportGenerate from "./reportgenerate";
import { Link } from "react-router-dom";
const { Title } = Typography;

//this file creates link for when user chooses to downloaded a particular report , redirects to the given page for report generation
class ReportPDF extends React.Component {
  state = {
    button: true,
    now: new Date(),
    date: this.props.date,
    data: []
  };

  onDownload = e => {
    this.setState({
      button: false
    });
    console.log(`Report downloaded for ${this.state.date}`)
  };

  render() {
    return (
      <Link
        to={{pathname: `/pdf/${this.state.date}`, state: {datePicked: ""}}}
      >
          <Button type="link">Download</Button>
      </Link>
    );
  }
}

export default ReportPDF;
