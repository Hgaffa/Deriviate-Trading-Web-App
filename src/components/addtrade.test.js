import React from "react";
import ReactDOM from "react-dom";
import Addtrade from "./addtrade";

it("renders without crashing", () => {
  const div = document.createElement("div");
  ReactDOM.render(<Addtrade />, div);
  ReactDOM.unmountComponentAtNode(div);
});
