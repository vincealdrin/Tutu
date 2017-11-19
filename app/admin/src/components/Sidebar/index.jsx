import React, { Component } from 'react';
import { Sidebar, Segment, Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import './styles.css';

class AppSidebar extends Component {
  render() {
    const {
      isExpanded,
    } = this.props;

    return (
      <div className="sidebar-container">
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            icon="labeled"
            animation="slide out"
            width="thin"
            as={Menu}
            visible={isExpanded}
            vertical
            inverted
          >
            <Menu.Item to="/" as={Link}>
              <Icon name="dashboard" />
              Dashboard
            </Menu.Item>
            <Menu.Item to="/sources" as={Link}>
              <Icon name="world" />
              Sources
            </Menu.Item>
            <Menu.Item to="/articles" as={Link}>
              <Icon name="newspaper" />
              Articles
            </Menu.Item>
            <Menu.Item to="/users" as={Link}>
              <Icon name="users" />
              Users
            </Menu.Item>
          </Sidebar>
          <Sidebar.Pusher>
            <div className="sidebar-children">
              {this.props.children}
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default AppSidebar;
