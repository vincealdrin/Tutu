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
    info,
  },
  pendingSources: {
    pendingSources,
  },
  socket,
}) => ({
  isLogin,
  info,
  socket,
  latestPendingSource: pendingSources.length ? pendingSources[0].url : '',
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  logout,
}, dispatch);

class App extends Component {
  componentDidMount() {
    const { socket, latestPendingSource } = this.props;

    Notification.requestPermission((status) => {
      if (status === 'granted' && navigator.serviceWorker) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          socket.on('newPendingSource', ({ url, isReliablePred, id }) => {
            console.log(latestPendingSource);
            console.log(url);
            console.log(latestPendingSource !== url);
            if (reg && latestPendingSource !== url) {
              reg.showNotification('There\'s a new pending source!', {
                body: `URL: ${url}\nPrediction: ${isReliablePred ? 'Credible' : 'Not Credible'}`,
                icon: 'favicon.ico',
                vibrate: [100, 50, 100],
                data: {
                  id,
                  url,
                },
                // actions: [
                //   {
                //     action: 'credible',
                //     title: 'Credible',
                //     icon: 'thumbs-up.png',
                //   },
                //   {
                //     action: 'not credible',
                //     title: 'Not Credible',
                //     icon: 'thumbs-down.png',
                //   },
                // ],
              });
            }
          });
        });
      }
    });
  }

  componentWillUnmount() {
    this.props.socket.removeAllListeners();
  }

  render() {
    const { isLogin, info } = this.props;

    return (
      <Sidebar
        isLogin={isLogin}
        logout={this.props.logout}
      >
        <Routes isLogin={isLogin} user={info} />
      </Sidebar>
    );
  }
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps,
)(App));
