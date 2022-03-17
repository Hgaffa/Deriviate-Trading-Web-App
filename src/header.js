import React from "react";
import { Link } from "react-router-dom";
import { Menu, Icon } from "antd";
import Addtrade from "./components/addtrade";
import Notifications from "./components/notifications";

//This file controls what is displayed on the header, including links to portflio page, reports and dashboard
const Header = () => (
  <>
    <Menu theme="light" defaultSelectedKeys={["1"]} mode="horizontal">
      <Menu.Item key="1">
        <Icon type="fund" />
        <span>Dashboard</span>
        <Link to="/" />
      </Menu.Item>
      <Menu.Item key="2">
        <Icon type="pie-chart" />
        <span>Portfolio</span>
        <Link to="/portfolio" />
      </Menu.Item>
      <Menu.Item key="3">
        <Icon type="file-search" />
        <span>Reports</span>
        <Link to="/reports" />
      </Menu.Item>
      <Menu.Item style={{ float: "right" }} key="5">
        <Notifications />
      </Menu.Item>
      <Menu.Item style={{ float: "right" }} key="4">
        <Addtrade />
      </Menu.Item>
    </Menu>
  </>
);

export default Header;
