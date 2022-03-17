import React from "react";
import { Modal, Button, Popconfirm, Descriptions } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Edittrade from "./edittrade";
import { Link } from "react-router-dom";
import axios from "axios";

//Shows all trade information for given trade, if the trade is in the portfolio page then just shows edit/delete options, if in notifications/alerts then allows user to ignore the flagged tradee.
function ViewtradeComponent(props) {
  if (props.data.ignore){
    return (
      <>
        <Button type="link" onClick={props.showModal}>{props.data.tradeid}</Button>
          <Modal
            width={700}
            visible={props.data.visible}
            title="View trade"
            onOk={props.handleOk}
            onCancel={props.handleCancel}
            footer={[
              <Button key="cancel" onClick={props.handleCancel}>
                Back
              </Button>,
              <Edittrade data={props.data.tradeid} sensitivity={props.data.sensitivity} updateSens={props.data.updateSens}/>,
              <Link
                to={{pathname: `/`, state: {data: props}}}
              >
                <Button key="delete" type="danger" onClick={props.handleDelete}>
                  Delete
                </Button>
              </Link>,
              <Link
                to={{pathname: `/`, state: {data: props}}}
              >
                <Button key="ignore" type="primary" onClick={props.handleIgnore}>
                  Ignore
                </Button>
              </Link>
            ]}
          >
            <Descriptions title={`Trade ${props.data.tradeid}`}>
              <Descriptions.Item label="Buying party">
                {props.data.data.BuyingParty}
              </Descriptions.Item>
              <Descriptions.Item label="Selling party">
                {props.data.data.SellingParty}
              </Descriptions.Item>
              <Descriptions.Item label="Product Name">
                {props.data.data.Product}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {props.data.data.Quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Notional currency">
                {props.data.data.NotionalCurrency}
              </Descriptions.Item>
              <Descriptions.Item label="Underlying currency">
                {props.data.data.UnderlyingCurrency}
              </Descriptions.Item>
              <Descriptions.Item label="Strike price">
                {props.data.data.StrikePrice}
              </Descriptions.Item>
              <Descriptions.Item label="Market value">
                {props.data.data.NotionalAmount}
              </Descriptions.Item>
              <Descriptions.Item label="Notional value">
                {props.data.data.UnderlyingPrice}
              </Descriptions.Item>
              <Descriptions.Item label="Expiry date">
                {props.data.data.MaturityDate}
              </Descriptions.Item>
            </Descriptions>
          </Modal>
      </>
    );
  }else{
    return (
      <>
        <Button type="link" onClick={props.showModal}>{props.data.tradeid}</Button>
          <Modal
            width={700}
            visible={props.data.visible}
            title="View trade"
            onOk={props.handleOk}
            onCancel={props.handleCancel}
            footer={[
              <Button key="cancel" onClick={props.handleCancel}>
                Back
              </Button>,
              <Edittrade data={props.data.tradeid}/>,
              <Link
                to={{pathname: `/`, state: {data: props}}}
              >
                <Button key="delete" type="danger" onClick={props.handleDelete}>
                  Delete
                </Button>
              </Link>
            ]}
          >
            <Descriptions title={`Trade ${props.data.tradeid}`}>
              <Descriptions.Item label="Buying party">
                {props.data.data.BuyingParty}
              </Descriptions.Item>
              <Descriptions.Item label="Selling party">
                {props.data.data.SellingParty}
              </Descriptions.Item>
              <Descriptions.Item label="Product Name">
                {props.data.data.Product}
              </Descriptions.Item>
              <Descriptions.Item label="Quantity">
                {props.data.data.Quantity}
              </Descriptions.Item>
              <Descriptions.Item label="Notional currency">
                {props.data.data.NotionalCurrency}
              </Descriptions.Item>
              <Descriptions.Item label="Underlying currency">
                {props.data.data.UnderlyingCurrency}
              </Descriptions.Item>
              <Descriptions.Item label="Strike price">
                {props.data.data.StrikePrice}
              </Descriptions.Item>
              <Descriptions.Item label="Market value">
                {props.data.data.NotionalAmount}
              </Descriptions.Item>
              <Descriptions.Item label="Notional value">
                {props.data.data.UnderlyingPrice}
              </Descriptions.Item>
              <Descriptions.Item label="Expiry date">
                {props.data.data.MaturityDate}
              </Descriptions.Item>
            </Descriptions>
          </Modal>
      </>
    );
  }
}

export default ViewtradeComponent;
