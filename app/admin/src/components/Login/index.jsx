import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Segment, Image, Header } from 'semantic-ui-react';
import LoginForm from './LoginForm';
import './styles.css';
import { login } from '../../modules/user';
import tutuLogo from '../../assets/logo/tutu-logo.png';

const mapDispatchToProps = (dispatch) => bindActionCreators({
  login,
}, dispatch);

class Login extends Component {
  render() {
    return (
      <div className="login-container">
        <div className="login-form">
          <div className="try-this">
            <Image className="tutu-logo" src={tutuLogo} />
            <Header as="h1" textAlign="center">TUTÛ</Header>
            <p>Interactive Map of Philippines' Credible News</p>
          </div>
          <LoginForm login={this.props.login} />
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(Login);

