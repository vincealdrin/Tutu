import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Line, Pie } from 'react-chartjs-2';
import { getLineDataset, getLineChartOptions, getPieChartOptions } from '../../utils';

class SentimentCharts extends Component {
  state = { activeItem: 'line' };

  componentDidMount() {
    this.props.fetchSentimentInsights();
  }

  changeItem = (_, { name }) => this.setState({ activeItem: name });

  renderActiveItem = (
    sentimentLineData,
    sentimentPieData,
  ) => {
    const { isDatalabelShown, status } = this.props;
    const { activeItem } = this.state;

    switch (activeItem) {
      case 'line': {
        return (
          <Line
            data={sentimentLineData}
            options={getLineChartOptions(isDatalabelShown)}
            redraw={!status.pending}
          />
        );
      }
      case 'pie': {
        return (
          <Pie
            data={sentimentPieData}
            options={getPieChartOptions(isDatalabelShown)}
            redraw={!status.pending}
          />
        );
      }
      default:
        return <p>No Item</p>;
    }
  };

  render() {
    const { activeItem } = this.state;
    const {
      sentiment = [],
    } = this.props;

    const sentimentLineData = {
      labels: sentiment.labels,
      datasets: getLineDataset([
        {
          label: 'Positive',
          color: '41,199,202',
          data: sentiment.posCount,
        },
        {
          label: 'Neutral',
          color: '70,76,88',
          data: sentiment.neuCount,
        },
        {
          label: 'Negative',
          color: '234,95,72',
          data: sentiment.negCount,
        },
      ]),
    };
    const sentimentPieData = {
      labels: [
        'Positive',
        'Neutral',
        'Negative',
      ],
      datasets: [{
        data: [
          sentiment.posCount.reduce((a, b) => (a + b), 0),
          sentiment.neuCount.reduce((a, b) => (a + b), 0),
          sentiment.negCount.reduce((a, b) => (a + b), 0),
        ],
        backgroundColor: [
          '#29c7ca',
          '#464c58',
          '#ea5f48',
        ],
      }],
    };

    return (
      <div>
        <Menu pointing secondary className="modal-insight-menu">
          <Menu.Item name="line" active={activeItem === 'line'} onClick={this.changeItem} />
          <Menu.Item name="pie" active={activeItem === 'pie'} onClick={this.changeItem} />
        </Menu>
        {this.renderActiveItem(sentimentLineData, sentimentPieData)}
      </div>
    );
  }
}

export default SentimentCharts;
