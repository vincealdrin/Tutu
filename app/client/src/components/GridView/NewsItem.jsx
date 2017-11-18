import React, { Component } from 'react';
import { Card, Icon } from 'semantic-ui-react';

class NewsItems extends Component {
	render() {
		const extra = (
			<div>
				<a>
					<Icon name='thumbs up' />
					2.4k Likes
				</a>
				&nbsp;
				&nbsp;
				<a>
					<Icon name='share alternate' />
					5k Shares
				</a>
			</div>
		)

		return (
			<Card 
				image={this.props.newsArticle.newsImage}
				header={this.props.newsArticle.newsHeader}
				meta={this.props.newsArticle.newsMeta}
				description={this.props.newsArticle.newsDescription}
				extra={extra}
				className='MarginBottom'
			/>
		)
	}
}

export default NewsItems;