import React from "react";
import moment from "moment";
//moment is used for create a date format for date comparisons

import {
  Divider,
  Form,
  Select,
  Input,
  DatePicker,
  TimePicker,
  Button,
  Radio,
  Modal,
  Popconfirm,
  Tooltip,
  Icon,
} from "antd";
import { Row } from "react-flexbox-grid";
import "./addtrade.css";


//Basic error detection and data validation occurs in this file.
const { Option } = Select;
const onFinish = values => {
  values.preventDefault();
  console.log("form inputs recieved:", values);
};

//used to compare dates in the calendar when choosing a maturity date and disabling dates below the current data, in this case 2020-01-01 which has been explained in the report for this choise of date
function disabledDate(current) {
  let customDate = "2020-01-01";
  return current && current < moment(customDate, "YYYY-MM-DD");
}

//Addtrade child componnent
function AddtradeComponent(props) {

  //These variables are used to only let the user verify his inputted trade data only when all of the form fields have been complete without any error (caught earlier)
  //The add trade/submit form is only enabled when the user has successfully verified his trade data, now they can submit the form to send data to be inputted into the database and passeed through ML
  var isDisabled =
    props.data.buyingParty.valid == "error" ||
    props.data.sellingParty.valid == "error" ||
    props.data.quantity.valid == "error" ||
    props.data.strikePrice.valid == "error";
  var isFilled =
    props.data.buyingParty.value.length > 0 &&
    props.data.sellingParty.value.length > 0 &&
    props.data.quantity.value > 0 &&
    props.data.strikePrice.value > 0 &&
    props.data.underlyingCurrency.value.length > 0 &&
    props.data.notionalCurrency.value.length > 0 &&
    props.data.productStock.value.length > 0 &&
    props.data.expiryDate.value.length > 0;
  var isProduct =
    (props.data.productStock.value == "Product" &&
      props.data.productName.value.length > 0) ||
    props.data.productStock.value == "Stocks";
  var formCompleted = !isDisabled && isFilled && isProduct ? true : false;
  if (formCompleted === true) {
    //This will log all of the form data to show that we have correctly saved form fields to state
    console.log("THESE ARE THE FORM VALUES:");
    console.log(`Buying Party: ${props.data.buyingParty.value}`);
    console.log(`Selling Party: ${props.data.sellingParty.value}`);
    console.log(`Product/Stock: ${props.data.productStock.value}`);
    console.log(`Product Name: ${props.data.productName.value}`);
    console.log(`Quantity: ${props.data.quantity.value}`);
    console.log(`Underlying Currency: ${props.data.underlyingCurrency.value}`);
    console.log(`Notional Currency: ${props.data.notionalCurrency.value}`);
    console.log(`Strike Price: ${props.data.strikePrice.value}`);
    console.log(`Expiry Date: ${props.data.expiryDate.value}`);
  }
    //This JSX code displays all of the form fields to the user and controls the UI/UX of the add trade form
    //Add form is modal all the elements have event handle triggers that call the appropriate event handler explained previously
  return (
    <>
      <Tooltip title="Add trade">
        <Button
          type="primary"
          shape="circle"
          style={{ textAlign: "center", verticalAlign: "baseline" }}
          onClick={props.showModal}
        >
          {" "}
          <Icon type="plus" style={{ color: "#fff" }} theme="outlined" />
        </Button>
      </Tooltip>
      <Modal
        width={700}
        closable={false}
        visible={props.data.visible}
        title="Add a new trade"
        footer={null}
        onOk={props.handleOk}
        onCancel={props.handleCancel}
      >
        <section style={{ textAlign: "center", marginTop: 16, marginLeft: 20 }}>
          <Row around="xs">
            <Form layout="inline" onSubmit={props.handleSubmit}>
              <Form.Item
                label="Buying party:"
                validateStatus={props.data.buyingParty.valid}
                help={props.data.buyingParty.help}
              >
                <Select
                  showSearch
                  style={{ width: 170 }}
                  placeholder="Yourself"
                  name="buyingParty"
                  onChange={props.handleBuyer}
                >
                  {props.data.companyList.map(company => (
                    <Option key={company} value={company}>
                      {company}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Selling party:"
                validateStatus={props.data.sellingParty.valid}
                help={props.data.sellingParty.help}
              >
                <Select
                  showSearch
                  style={{ width: 170 }}
                  placeholder="Them"
                  name="sellingParty"
                  onChange={props.handleSeller}
                >
                  {props.data.companyList.map(company => (
                    <Option key={company} value={company}>
                      {company}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <br />
              <Form.Item label="Product / Stock:" style={{ marginTop: 16 }}>
                <Radio.Group
                  buttonStyle="solid"
                  name="productStock"
                  onChange={props.handleNumber}
                >
                  <Radio.Button value="Product" onClick={props.enableField}>
                    Product
                  </Radio.Button>
                  <Radio.Button value="Stocks" onClick={props.disableField}>
                    Stock
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
              <br />
              <Form.Item label="Product name: " style={{ marginTop: 16 }}>
                <Select
                  disabled={props.data.disabled}
                  showSearch
                  style={{ width: 170 }}
                  placeholder="Product name"
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                  onChange={props.handleDropdown}
                >
                  {props.data.productList.map(product => (
                    <Option key={product} value={product}>
                      {product}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Quantity: "
                style={{ marginTop: 16 }}
                validateStatus={props.data.quantity.valid}
                help={props.data.quantity.help}
              >
                <Input
                  name="quantity"
                  onChange={props.handleNumber}
                  style={{ width: 170 }}
                />
              </Form.Item>
              <br />
              <Form.Item label="Notional currency: " style={{ marginTop: 16 }}>
                <Select
                  showSearch
                  style={{ width: 170 }}
                  placeholder="Currency"
                  onChange={props.handleNotional}
                >
                  {props.data.currencyList.map(currency => (
                    <Option key={currency} value={currency}>
                      {currency}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="Underlying currency: "
                style={{ marginTop: 16 }}
              >
                <Select
                  showSearch
                  style={{ width: 170 }}
                  placeholder="Currency"
                  onChange={props.handleUnderlying}
                >
                  {props.data.currencyList.map(currency => (
                    <Option key={currency} value={currency}>
                      {currency}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <br />
              <Row around="xs">
                <section style={{ textAlign: "left" }}>
                  <Form.Item
                    label="Strike Price: "
                    style={{ marginTop: 16 }}
                    validateStatus={props.data.strikePrice.valid}
                    help={props.data.strikePrice.help}
                  >
                    <Input
                      style={{ width: 140 }}
                      name="strikePrice"
                      value={props.data.strikePrice.value}
                      onChange={props.handleNumber}
                    />
                    <span className="ant-form-text">
                      {" "}
                      {props.data.notionalCurrency.value.toUpperCase()}
                    </span>
                  </Form.Item>
                  <br />
                  <Form.Item label="Market value: ">
                    <span className="ant-form-text">
                      {" "}
                      {
                        props.data.verifiedData.marketValue
                      }{" "}
                      {props.data.underlyingCurrency.value.toUpperCase()}
                    </span>
                  </Form.Item>
                  <br />
                  <Form.Item label="Notional value: ">
                    <span className="ant-form-text">
                      {" "}
                      {
                        props.data.verifiedData.notionalValue
                      }{" "}
                      {props.data.notionalCurrency.value.toUpperCase()}
                    </span>
                  </Form.Item>
                  <br />
                  <Form.Item label="Current price: ">
                    <span className="ant-form-text">
                      {" "}
                      {
                        props.data.verifiedData.currentValue
                      }{" "}
                      {props.data.underlyingCurrency.value.toUpperCase()}
                    </span>
                  </Form.Item>
                </section>
              </Row>
              <Divider />
              <Form.Item name="date-picker" label="Expiry date:">
                <DatePicker
                  onChange={props.handleExpirydate}
                  disabledDate={disabledDate}
                />
              </Form.Item>
              <br />
              <Button
                type="primary"
                ghost
                onClick={props.handleVerify}
                style={{ marginTop: 16 }}
                disabled={!formCompleted}
              >
                Verify
              </Button>
              <Divider />
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={!props.data.isVerified}
                >
                  Add
                </Button>
                <Popconfirm
                  title="Are you sure you want to cancel?"
                  onConfirm={props.handleCancel}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button style={{ marginLeft: 8 }}>Cancel</Button>
                </Popconfirm>
              </Form.Item>
            </Form>
          </Row>
        </section>
      </Modal>
    </>
  );
}
export default AddtradeComponent;
