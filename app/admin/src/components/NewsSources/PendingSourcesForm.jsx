import React, { Component } from 'react';
import { Field, reduxForm } from 'redux-form';
import { InputField, Toggle } from 'react-semantic-redux-form';

class SourcesForm extends Component {
  render() {
    return (
      <div>
        <Field
          component={InputField}
          name="url"
          placeholder="URL"
          fluid
        />
        <Field
          component={InputField}
          name="brand"
          placeholder="Brand"
          fluid
        />
        <Field
          component={Toggle}
          name="isReliable"
          label="Reliable"
          fluid
        />
      </div>
    );
  }
}

export default reduxForm({
  form: 'pendingSources',
})(SourcesForm);
