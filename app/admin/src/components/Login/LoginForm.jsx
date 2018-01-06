import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Button } from 'semantic-ui-react';
import { InputField } from 'react-semantic-redux-form';

class LoginForm extends Component {
  _onSubmit = (e) => {
    e.preventDefault();
    this.props.login();
  }

  render() {
    const { login } = this.props;
    return (
      <form onSubmit={this._onSubmit}>
        <Field
          component={InputField}
          name="username"
          placeholder="username"
          fluid
        />
        <Field
          component={InputField}
          name="password"
          placeholder="password"
          fluid
        />
        <Button content="login" onClick={login} />
      </form>
    );
  }
}

export default reduxForm({
  form: 'login',
})(LoginForm);
