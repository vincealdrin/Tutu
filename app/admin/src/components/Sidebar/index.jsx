import React, { Component } from 'react';
import { Sidebar, Segment, Menu } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import MenuItems from './MenuItems';
import TopMenu from '../TopMenu';
import './styles.css';

const mapStateToProps = ({
  user: {
    info,
  },
}) => ({
  user: info,
});

class AppSidebar extends Component {
  state = { isExpanded: true }

  toggleExpand = () => this.setState({ isExpanded: !this.state.isExpanded })

  render() {
    const {
      isLogin,
      logout,
      user = { role: '' },
    } = this.props;
    const { isExpanded } = this.state;

    return (
      <div className="sidebar-container">
        <Sidebar.Pushable as={Segment}>
          <Sidebar
            icon="labeled"
            animation="slide out"
            width="thin"
            as={Menu}
            visible={user.role === 'superadmin' ? (isLogin && isExpanded) : false}
            vertical
            inverted
          >
            <MenuItems />
          </Sidebar>
          <Sidebar.Pusher>
            <TopMenu
              userInfo={user}
              toggleSidebarExpand={this.toggleExpand}
              isLogin={isLogin}
              logout={logout}
            />
            <div className="sidebar-children">
              {this.props.children}
            </div>
          </Sidebar.Pusher>
        </Sidebar.Pushable>
      </div>
    );
  }
}

export default connect(mapStateToProps)(AppSidebar);
