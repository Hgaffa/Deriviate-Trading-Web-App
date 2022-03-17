import React from "react";
import { ResponsiveContainer } from "recharts";
import { ResponsiveLine } from "@nivo/line";

//This file is for the chart that is displayed on the front page/dashboard of the web app. It was supposed to display real life data on a graph to aid the trade choices of users.
class Dashchart extends React.Component {
  state = {
    data: this.props.lazy,
  };

  //uses Nivo and recharts ResponsiveContainer to create a dynamic chart that can be used for acurate data analysis and view trends.
  //This is the child componenet to dashboard and uses fixed data as we did not have time to implement a live data implementations. More explained in the report.
  render() {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <ResponsiveLine
          data={this.state.data}
          margin={{ top: 20, right: 110, bottom: 70, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: true,
            reverse: false
          }}
          curve="natural"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -33,
            legend: "",
            legendOffset: 50,
            legendPosition: "middle"
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "USD",
            legendOffset: -40,
            legendPosition: "middle"
          }}
          colors="#006fff"
          pointSize={10}
          pointColor={{ theme: "background" }}
          pointBorderWidth={2}
          pointBorderColor={{ from: "serieColor" }}
          pointLabel="y"
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      </ResponsiveContainer>
    );
  }
}

export default Dashchart;
//ReactDOM.render(<Dashchart />, mountNode);
