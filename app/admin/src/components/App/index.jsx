import React, { Component } from 'react';
import axios from 'axios';
import 'semantic-ui-css/semantic.min.css';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { logout } from '../../modules/user';
import Sidebar from '../Sidebar';
import Routes from './Routes';
import './styles.css';

axios.defaults.baseURL = '/api/admin';

const mapStateToProps = ({
  user: {
    isLogin,
    token,
  },
}) => ({
  isLogin,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  logout,
}, dispatch);

class App extends Component {
  render() {
    const { isLogin } = this.props;

    return (
      <Sidebar
        isLogin={isLogin}
        logout={this.props.logout}
      >
        <Routes isLogin={isLogin} />
      </Sidebar>
    );
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(App));
