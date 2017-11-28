import { HorizontalBar, Bar } from 'react-chartjs-2';
import React, { Component } from 'react';
import { Grid, Label, Segment } from 'semantic-ui-react';
import Statistics from './Statistics';
import SpiderSection from './SpiderSection';
import './styles.css';

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

class Home extends Component {
  render() {
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={7}>
            <Segment>
                Country
            </Segment>
            <Segment>
              <HorizontalBar
                data={data}
              />
            </Segment>
          </Grid.Column>

          <Grid.Column width={9}>
            <Statistics />
            <Segment>
              <Bar
                data={data}
              />
            </Segment>
          </Grid.Column>
        </Grid.Row>

        <SpiderSection />
      </Grid>
    );
  }
}

export default Home;
