import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'semantic-ui-react';
import './style.css';

class MenuItems extends Component {

	state = { activeItem: 'map' };
	handleItemClick = (e, { name }) => this.setState({ activeItem: name });

	render() {

		const { activeItem } = this.state;

		return (
			<Menu secondary vertical icon="labeled" className="margin-top">
				<Menu.Item name="home" to="/" as={Link} onClick={this.handleItemClick} className="tutu-logo">
					<Icon name="map" color="grey" />
				</Menu.Item>
				<Menu.Item name="map" to="/" as={Link} active={ activeItem === "map" } onClick={this.handleItemClick}>
					<Icon name="newspaper" />
				</Menu.Item>
				<Menu.Item name="grid" to="/grid" as={Link} active={ activeItem === "grid" } onClick={this.handleItemClick}>
					<Icon name="grid layout" />
				</Menu.Item>
				<Menu.Item name="list" to="/list" as={Link} active={ activeItem === "list" } onClick={this.handleItemClick}>
					<Icon name="list layout" />
				</Menu.Item>
			</Menu>
		)
	}
}

export default MenuItems;
