import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LoginForm from './LoginForm';
import './styles.css';
import { login } from '../../modules/user';

const mapDispatchToProps = (dispatch) => bindActionCreators({
  login,
}, dispatch);

class Login extends Component {
  render() {
    return (
      <div>
        <LoginForm login={this.props.login} />
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(Login);

