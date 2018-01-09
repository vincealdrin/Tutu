import React, { Component } from 'react';
import { Header } from 'semantic-ui-react';
import WordCloud from 'react-d3-cloud';
import { getLineDataset } from '../../utils';

class InsightWordCloud extends Component {
	render() {
		const {
			wordCloud = [],
		} = this.props;

		return (
			<div className="word-cloud">
				<WordCloud
					font="lato"
					width={700}
					height={500}
					// padding={(word) => word.value / 10}
					data={wordCloud}
					fontSizeMapper={(word) => Math.log2(word.value) * 10}
					rotate={(word) => word.value % 360}
				/>
			</div>
		)
	}
}

export default InsightWordCloud;
