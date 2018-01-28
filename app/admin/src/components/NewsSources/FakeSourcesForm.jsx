import React, { Component } from 'react';
import shortid from 'shortid';
import { Field, reduxForm } from 'redux-form';
import { InputField } from 'react-semantic-redux-form';

class SourcesForm extends Component {
  state = { inputs: [] }

  reset = () => this.setState({ inputs: [] })

  addInput = () => {
    const id = this.state.inputs.length + 1;
    this.setState({
      inputs: [
        ...this.state.inputs,
        <Field
          key={shortid.generate()}
          component={InputField}
          name={`source-${id}`}
          icon="world"
          iconPosition="left"
          placeholder="Source URL"
          action={{
            color: 'orange',
            icon: 'remove',
            content: 'Remove',
            onClick: () => this.removeInput(id),
          }}
          fluid
        />,
      ],
    });
  }

  removeInput = (id) => {
    this.setState({
      inputs: this.state.inputs.filter((_, i) => (i + 1) !== id),
    });
  }

  render() {
    return (
      <div>
        {/* {inputs} */}
        <Field
          component={InputField}
          name="source1"
          icon="world"
          iconPosition="left"
          placeholder="Source URL"
          // action={{
          //   color: 'teal',
          //   icon: 'add',
          //   content: 'Add Input',
          //   onClick: this.addInput,
          // }}
          fluid
        />
        <br />
        <Field
          component={InputField}
          name="source2"
          icon="world"
          iconPosition="left"
          placeholder="Source URL"
          // action={{
          //   color: 'teal',
          //   icon: 'add',
          //   content: 'Add Input',
          //   onClick: this.addInput,
          // }}
          fluid
        />
        <br />
        <Field
          component={InputField}
          name="source3"
          icon="world"
          iconPosition="left"
          placeholder="Source URL"
          // action={{
          //   color: 'teal',
          //   icon: 'add',
          //   content: 'Add Input',
          //   onClick: this.addInput,
          // }}
          fluid
        />
      </div>
    );
  }
}

export default reduxForm({
  form: 'fakeSources',
})(SourcesForm);
