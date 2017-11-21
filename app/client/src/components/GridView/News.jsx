import React, { Component } from 'react';
import NewsItem from './NewsItem';
import MasonryLayout from 'react-masonry-component';

class News extends Component {
	
	static defaultProps = { maxCount: 4 }
	renderNewsItem = (newsArticle) => <NewsItem key={newsArticle.newsImage} newsArticle={newsArticle} />
	
	render() {
		const { news = [] } = this.props;

		return (
			<div style={{ width: 1380 }}>
				<MasonryLayout className="margin-left">
					{news.map(this.renderNewsItem)}
				</MasonryLayout>

			</div>
		)
	}
}

export default News;

