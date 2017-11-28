import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { HorizontalBar, Bar, Line } from 'react-chartjs-2';
import { Sidebar, Segment, Grid, Label } from 'semantic-ui-react';
import { incErrorCount, incSuccessCount, fetchStats } from '../../modules/crawler';
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

const mapStateToProps = ({
  crawler: {
    stats,
    logs,
    fetchStatsStatus,
    fetchLogsStatus,
  },
  socket,
}) => ({
  stats,
  logs,
  fetchStatsStatus,
  fetchLogsStatus,
  socket,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchStats,
  incSuccessCount,
  incErrorCount,
}, dispatch);


class Crawler extends Component {
  componentDidMount() {
    this.props.fetchStats(() => {
      const { socket, stats: { labels } } = this.props;
      let latest = labels[labels.length - 1];

      socket.on('articleCrawl', (log) => {
        const logDate = new Date(log.timestamp).toLocaleDateString();

        if (logDate !== latest) {
          latest = logDate;
          this.props.fetchStats();
        } else if (log.status === 'success') {
          this.props.incSuccessCount();
        } else {
          this.props.incErrorCount();
        }
      });
    });
  }

  componentWillUnmount() {
    const { socket } = this.props;
    socket.removeAllListeners();
  }

  render() {
    const { stats } = this.props;
    const statsData = {
      labels: stats.labels,
      datasets: [
        {
          label: 'Success',
          fill: true,
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
          data: stats.successCounts,
        },
        {
          label: 'Error',
          fill: true,
          lineTension: 0.1,
          backgroundColor: 'rgba(255,99,132,0.4)',
          borderColor: 'rgba(255,99,132,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(255,99,132,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(255,99,132,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: stats.errorCounts,
        },
      ],
    };

    return (
      <div className="crawler-container">
        <Grid>
          <Grid.Row>
            <Grid.Column width={7}>
              <Segment>
                <Line data={statsData} />
              </Segment>
            </Grid.Column>

            <Grid.Column width={9}>
              <Segment>
                <Bar
                  data={data}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>

        <Grid.Row>
          <Grid.Column width={6}>
            <Segment>
              <Line data={statsData} />
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
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Crawler);

