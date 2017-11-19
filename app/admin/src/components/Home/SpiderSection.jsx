import React, { Component } from 'react';
import { Grid, Label, Segment } from 'semantic-ui-react';
import { Line } from 'react-chartjs-2';

const data = {
  type: 'horizontalBar',
  labels: ['Business', 'Economy', 'Lifestyle',
    'Entertainment', 'Sports', 'Government & Politics',
    'Health', 'Science & Technology', 'Crime', 'Weather'],
  datasets: [
    {
      label: 'Categories',
      backgroundColor: 'rgba(255,99,132,0.2)',
      borderColor: 'rgba(255,99,132,1)',
      borderWidth: 1,
      barThickness: 1,
      hoverBackgroundColor: 'rgba(255,99,132,0.4)',
      hoverBorderColor: 'rgba(255,99,132,1)',
      data: [65, 59, 80, 81, 56, 55, 40, 34, 45, 66, 77],
    },
  ],
};

const data2 = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'My First dataset',
      fill: false,
      lineTension: 0.1,
      backgroundColor: 'rgba(75,192,192,0.4)',
      borderColor: 'rgba(75,192,192,1)',
      borderCapStyle: 'butt',
      borderDash: [],
      borderDashOffset: 0.0,
      borderJoinStyle: 'miter',
      pointBorderColor: 'rgba(75,192,192,1)',
      pointBackgroundColor: '#fff',
      pointBorderWidth: 1,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: 'rgba(75,192,192,1)',
      pointHoverBorderColor: 'rgba(220,220,220,1)',
      pointHoverBorderWidth: 2,
      pointRadius: 1,
      pointHitRadius: 10,
      data: [65, 59, 80, 81, 56, 55, 40],
    },
  ],
};

class SpiderSection extends Component {
  render() {
    return (
      <Grid.Row>
        <Grid.Column width={6}>
          <Segment>
            <Line data={data} />
          </Segment>
        </Grid.Column>

        <Grid.Column width={10}>
          <Grid columns={2}>
            <Grid.Column>
              <Segment>
              3gg<Label attached="top right">Code</Label>
              </Segment>
            </Grid.Column>
            <Grid.Column>
              <Segment>
              3gg<Label attached="top right">Code</Label>
              </Segment>
            </Grid.Column>
          </Grid>
        </Grid.Column>
      </Grid.Row>

    );
  }
}

export default SpiderSection;
