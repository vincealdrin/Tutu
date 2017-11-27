import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const MenuItems = () => (
  <div>
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
    <Menu.Item to="/crawler" as={Link}>
      <Icon name="bug" />
      Crawler
    </Menu.Item>
  </div>
);

export default MenuItems;
