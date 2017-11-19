import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import NewsItem from './NewsItem';

class News extends Component {
	
	renderNewsItem = (newsArticle) => <NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
	
	render() {
		const {
			newsFirst = [],
			newsSecond = [],
		} = this.props;

		return (
			<Grid style={{ width: 1380 }}>
				<Grid.Row className='MarginLeft' columns={4}>
					<Grid.Column>
						{newsFirst.map(renderNewsItem)}
					</Grid.Column>
					<Grid.Column>
						{newsSecond.map(renderNewsItem)}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		)
	}
}

export default News;

