import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Icon, Label, Sidebar, Segment, Button } from 'semantic-ui-react';
import RecentArticles from '../RecentArticles';
import './style.css';

class AppSidebar extends Component {
  state = { activeItem: 'map', visible: true };
  toggleVisibility = () => this.setState({ visible: !this.state.visible });
  handleItemClick = (e, { name }) => this.setState({ activeItem: name });

  render() {
    const { activeItem, visible } = this.state;

    return (
      <div className="wrapper">
        <div className="sidebar">
          <Sidebar.Pushable className="articles">
            <Sidebar
              animation="overlay"
              width="wide"
              direction="right"
              visible={visible}
              icon="labeled"
              className="inherit-width"
              vertical
            >
              <Label as="a" color="red" ribbon className="remove-overflow">Recent News</Label>
          HELLO
            </Sidebar>
          </Sidebar.Pushable>

          <section className="menu">
            <Menu secondary vertical icon="labeled">
              <Menu.Item
                name="home"
                to="/"
                as={Link}
                onClick={this.handleItemClick}
                className="tutu-logo"
              >
                <Icon name="map" color="grey" />
              </Menu.Item>
              <Menu.Item
                name="map"
                to="/"
                as={Link}
                active={activeItem === 'map'}
                onClick={this.handleItemClick}
              >
                <Icon name="newspaper" />
              </Menu.Item>
              <Menu.Item
                name="grid"
                to="/grid"
                as={Link}
                active={activeItem === 'grid'}
                onClick={this.handleItemClick}
              >
                <Icon name="grid layout" />
              </Menu.Item>
              <Menu.Item
                name="list"
                to="/list"
                as={Link}
                active={activeItem === 'list'}
                onClick={this.handleItemClick}
              >
                <Icon name="list layout" />
              </Menu.Item>
              <Menu.Item onClick={this.toggleVisibility}>
                <Icon name="eye" />
              </Menu.Item>
            </Menu>
          </section>
        </div>
      </div>
    );
  }
}

export default AppSidebar;
