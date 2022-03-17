import React from "react";
import { Typography, Table, Tag, Button } from "antd";
const { Title } = Typography;

function ReportpdfComponent(props) {
  return (
    <>
      {props.button === true ? (
        <Button type="link" onClick={props.showReport}>
          {props.data.report}
        </Button>
      ) : (
        <section style={{ margin: 20 }}>
          <Title>Trade report</Title>
          {"Report generated on "}
          {props.data.date.toLocaleDateString("zh-CN")}
          {" at "}
          {props.data.date.toLocaleTimeString()}
          <Table dataSource={this.props.data.trades} columns={this.props.columns} />
        </section>
      )}
    </>
  );
}
export default ReportpdfComponent;
