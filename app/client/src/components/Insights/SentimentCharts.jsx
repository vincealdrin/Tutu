import React, { Component } from 'react';
import { Menu } from 'semantic-ui-react';
import { Line, Pie } from 'react-chartjs-2';
import { getLineDataset } from '../../utils';

const ActiveMenuItem = ({
  activeItem,
  sentimentLineData,
  sentimentPieData,
}) => {
  switch (activeItem) {
    case 'line': {
      return <Line data={sentimentLineData} />;
    }
    case 'pie': {
      return <Pie data={sentimentPieData} />;
    }
    default:
      return <p>No Item</p>;
  }
};
class SentimentCharts extends Component {
  state = { activeItem: 'line' };

  componentDidMount() {
    this.props.fetchSentimentInsights();
  }
  changeItem = (_, { name }) => this.setState({ activeItem: name });

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
        <ActiveMenuItem
          activeItem={activeItem}
          sentimentPieData={sentimentPieData}
          sentimentLineData={sentimentLineData}
        />
      </div>
    );
  }
}

export default SentimentCharts;
