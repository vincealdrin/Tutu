import React from 'react';
import { Menu, Button, Icon } from 'semantic-ui-react';

const TopMenu = ({
  toggleSidebarExpand,
  isLogin,
  logout,
  userInfo,
}) => (
  <Menu className="app-menu" style={{ display: `${isLogin ? 'block' : 'none'}` }}>
    {isLogin ? (
      <div>
        <Menu.Item>
          <Button onClick={toggleSidebarExpand} icon>
            <Icon name="content" />
          </Button>
        </Menu.Item>
        <Menu.Menu>
          Hello, {userInfo.name}
          <Menu.Item>
            <Button content="Logout" onClick={logout} />
          </Menu.Item>
        </Menu.Menu>
      </div>
    ) : null}
  </Menu>
);

export default TopMenu;
