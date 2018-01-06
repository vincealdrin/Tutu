import React from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';

const TopMenu = ({ toggleSidebarExpand, isLogin, logout }) => (
  <Menu className="app-menu">
    {isLogin ? (
      <Menu.Item>
        <Button onClick={toggleSidebarExpand} icon>
          <Icon name="content" />
        </Button>
      </Menu.Item>
      ) : null}
    <Menu.Menu position="right">
      {isLogin ? (
        <Menu.Item>
          <Button content="Logout" onClick={logout} />
        </Menu.Item>
    ) : null}
    </Menu.Menu>
  </Menu>
);

export default TopMenu;
