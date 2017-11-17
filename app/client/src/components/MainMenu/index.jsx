import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { Menu, Icon } from 'semantic-ui-react';
import Home from '../Home';
import Counter from '../Counter';
import GridLayout from '../GridView';
import './style.css';

class MainMenu extends Component {

	state = { activeItem: 'map' }
	handleMenuClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
		const { activeItem } = this.state

        return (
            <div>
				<Menu icon='labeled' className='InFront' vertical>
					<Menu.Item name="home" to="/" as={Link} active={activeItem === 'map'} onClick={this.handleMenuClick}>
						<Icon name='legal' color='olive' />
					</Menu.Item>
					<Menu.Item name="map" to="/" as={Link} active={activeItem === 'map' } onClick={this.handleMenuClick}>
						<Icon name='map' />
					</Menu.Item>
					<Menu.Item name="grid" to="/grid" as={Link} active={activeItem === 'grid'} onClick={this.handleMenuClick}>
						<Icon name='grid layout' />
					</Menu.Item>
					<Menu.Item name="list" to="/list" as={Link} active={activeItem === 'list'} onClick={this.handleMenuClick}>
						<Icon name='list layout' />
					</Menu.Item>
				</Menu>

				<main>
					<Route exact path="/" component={Home} />
					<Route exact path="/counter" component={Counter} />
					<Route exact path="/grid" component={GridLayout} />
				</main>
            </div>
        )
    }
}

export default MainMenu;
