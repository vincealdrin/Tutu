import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { InputField } from 'react-semantic-redux-form';

class UserForm extends Component {
  render() {
    return (
      <div>
        <Field
          component={InputField}
          name="username"
          placeholder="Username"
          fluid
        />
        <Field
          component={InputField}
          name="password"
          placeholder="Password"
          fluid
        />
        <Field
          component={InputField}
          name="name"
          placeholder="Name"
          fluid
        />
        <Field
          component={InputField}
          name="role"
          placeholder="Role"
          fluid
        />
      </div>
    );
  }
}

export default reduxForm({
  form: 'user',
})(UserForm);
