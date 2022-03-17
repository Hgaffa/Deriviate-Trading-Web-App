import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Switch, Route, BrowserRouter as Router } from "react-router-dom";
import Header from "./header";
import Dashboard from "./dashboard";
import Portfolio from "./portfolio";
import Reports from "./reports";
import ReportPDF from "./components/reportpdf";
import ReportGenerate from "./components/reportgenerate";
import Notfound from "./404";
import * as serviceWorker from "./serviceWorker";

//routing to allow linking to other pages in the web app via their chosen urls
const routing = (
  <Router>
    <div>
      <Header />
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/reports" component={Reports} />
        <Route path="/pdf/:date" exact component={ReportGenerate} />
        <Route component={Notfound} />
      </Switch>
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
