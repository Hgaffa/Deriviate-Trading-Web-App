import React from "react";
import {
  Pie,
  PieChart,
  Cell,
  Tooltip,
} from "recharts";

const data = [
  {
    name: "AMD",
    value: 2400
  },
  {
    name: "NVDA",
    value: 4567
  },
  {
    name: "EBAY",
    value: 1398
  },
  {
    name: "AAPL",
    value: 7800
  },
];

const colours = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

class Portfoliochart extends React.Component {
  render() {
    return (
      <PieChart width={280} height={280}>
        <Tooltip />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }
}

export default Portfoliochart;
