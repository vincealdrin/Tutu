import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import { Line, Pie } from 'react-chartjs-2';
import { getLineDataset } from '../../utils';

class SentimentCharts extends Component {
	render() {
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
				<Line data={sentimentLineData} />
				<Pie data={sentimentPieData} />
			</div>
		)
	}
}

export default SentimentCharts;
