import React from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';

const TopMenu = ({ toggleSidebarExpand }) => (
  <Menu className="app-menu">
    <Menu.Item>
      <Button onClick={toggleSidebarExpand} icon>
        <Icon name="content" />
      </Button>
    </Menu.Item>
    <Menu.Menu position="right">
      <Menu.Item>
        Logout
      </Menu.Item>
    </Menu.Menu>
  </Menu>
);

export default TopMenu;
