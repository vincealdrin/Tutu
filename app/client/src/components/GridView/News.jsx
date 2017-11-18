import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import NewsItem from './NewsItem';

class News extends Component {
	render() {
		let newsItems1st, newsItems2nd, newsItems3rd, newsItems4th;
		if(this.props.newsFirst) {
			newsItems1st = this.props.newsFirst.map(newsArticle => {
				return (
					<NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
				)
			});
		}
		if(this.props.newsSecond) {
			newsItems2nd = this.props.newsSecond.map(newsArticle => {
				return (
					<NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
				)
			});
		}
		if(this.props.newsFourth) {
			newsItems4th = this.props.newsFourth.map(newsArticle => {
				return (
					<NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
				)
			});
		}
		if(this.props.newsThird) {
			newsItems3rd = this.props.newsThird.map(newsArticle => {
				return (
					<NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
				)
			});
		}

		return (
			<Grid style={{ width: 1380 }}>
				<Grid.Row className='MarginLeft' columns={4}>
					<Grid.Column>
						{newsItems1st}
					</Grid.Column>
					<Grid.Column>
						{newsItems2nd}
					</Grid.Column>
					<Grid.Column>
						{newsItems3rd}
					</Grid.Column>
					<Grid.Column>
						{newsItems4th}
					</Grid.Column>
				</Grid.Row>
			</Grid>
		)
	}
}

export default News;

