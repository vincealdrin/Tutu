import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Label, Header } from 'semantic-ui-react';
import './style.css';

class NewsMenu extends Component {

	render() {

		const listItemStyle = {
			display: 'flex',
			padding: '1.5rem',
			alignItems: 'center',
			justifyContent: 'space-between'
		};

		const newsItems = [
			{ iconName: 'paint brush', newsName: 'Arts', newItem: 12, route: '/' },
			{ iconName: 'law', newsName: 'Economics', newItem: 3, route: '/grid' },
			{ iconName: 'game', newsName: 'Gaming', newItem: 51, route: '/list' },
			{ iconName: 'heartbeat', newsName: 'Health', newItem: 2, route: '/' },
			{ iconName: 'ticket', newsName: 'Entertainment', newItem: 41, route: '/' },
			{ iconName: 'users', newsName: 'Political', newItem: 71, route: '/' },
			{ iconName: 'soccer', newsName: 'Sports', newItem: 34, route: '/' }
		];

		const listItems = newsItems.map(news => {
			return (
				<Menu.Item to={news.route} as={Link} style={listItemStyle} className='NewsMenuItems'>
					<div>
						<Icon name={news.iconName} color='grey' size='large' />
						<span style={{ marginLeft: '2rem', fontSize: '1.2rem' }}>{news.newsName}</span>
					</div>
					<Label>{news.newItem}</Label>
				</Menu.Item>
			)
		});

		return (
			<div>
				<Menu secondary vertical className='NewsMenu' style={{ width: 400 }}>
				<section className='Bleed'>
					<Header as='h2' style={{ color: '#fff' }}>Recent News:</Header>
				</section>
					{listItems}
				</Menu>
			</div>
		);
	}
};

export default NewsMenu;