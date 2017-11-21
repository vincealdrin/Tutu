import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Popup } from 'semantic-ui-react';
import './style.css';

class MainMenu extends Component {
  state = { activeItem: 'map' }
  handleMenuClick = (e, { name }) => this.setState({ activeItem: name })

  render() {
    const { activeItem } = this.state;

    return (
      <Menu icon="labeled" className="in-front" vertical>
        <Menu.Item name="home" to="/" as={Link} active={activeItem === 'map'} onClick={this.handleMenuClick}>
          <Icon name="legal" color="olive" />
        </Menu.Item>

        <Popup
          trigger={<Menu.Item name="map" to="/" as={Link} active={activeItem === 'map'} onClick={this.handleMenuClick}><Icon name="map" /></Menu.Item>}
          content="Map View"
          position="right center"
          inverted
        />
        <Popup
          trigger={<Menu.Item name="grid" to="/grid" as={Link} active={activeItem === 'grid'} onClick={this.handleMenuClick}><Icon name="grid layout" /></Menu.Item>}
          content="Grid View"
          position="right center"
          inverted
        />
        <Popup
          trigger={<Menu.Item name="list" to="/list" as={Link} active={activeItem === 'list'} onClick={this.handleMenuClick}><Icon name="list layout" /></Menu.Item>}
          content="List View"
          position="right center"
          inverted
        />
      </Menu>
    );
  }
}

export default MainMenu;
