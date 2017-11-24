import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Label, Header } from 'semantic-ui-react';
import './style.css';

// datepicker components
import DatepickerButton from './DatepickerButton';
import Datepicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

class NewsMenu extends Component {

	newsItems = [
	  {
 iconName: 'paint brush', newsName: 'Arts', newItem: 12, route: '/' 
},
	  {
 iconName: 'law', newsName: 'Economics', newItem: 3, route: '/grid' 
},
	  {
 iconName: 'game', newsName: 'Gaming', newItem: 51, route: '/list' 
},
	  {
 iconName: 'heartbeat', newsName: 'Health', newItem: 2, route: '/' 
},
	  {
 iconName: 'ticket', newsName: 'Entertainment', newItem: 41, route: '/' 
},
	  {
 iconName: 'users', newsName: 'Political', newItem: 71, route: '/' 
},
	  {
 iconName: 'soccer', newsName: 'Sports', newItem: 34, route: '/' 
},
	];

	listItemStyle = {
	  display: 'flex',
	  padding: '1.5rem',
	  alignItems: 'center',
	  justifyContent: 'space-between',
	};

	listItems = this.newsItems.map((news) => (
			<Menu.Item to={news.route} as={Link} style={this.listItemStyle} className="news-menu-items">
				<div>
					<Icon name={news.iconName} color="grey" size="large" />
					<span style={{ marginLeft: '2rem', fontSize: '1.2rem' }}>{news.newsName}</span>
				</div>
				<Label>{news.newItem}</Label>
			</Menu.Item>
		));

	constructor() {
	  super();

	  this.state = { startDate: moment() };
	}

	handleChange(date) {
	  this.setState({
	    startDate: date,
	  });
	}

	render() {
	  return (
  <div>
  <Menu secondary vertical className="news-menu" style={{ width: 400 }}>
  <section className="bleed">
  <Header as="h2" style={{ color: '#fff' }}>Recent News:</Header>
				</section>
  {this.listItems}
  <section className="bleed bottom-bleed">
  <Datepicker
  customInput={<DatepickerButton />}
  selected={this.state.startDate}
  onChange={this.handleChange.bind(this)}
  monthsShown={2}
					/>
				</section>
				</Menu>
			</div>
	  );
	}
}

export default NewsMenu;
