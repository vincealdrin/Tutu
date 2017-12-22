import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Segment, Label, Header, Input, Button, Message } from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    submitStatus: '',
    result: '',
    url: '',
  };

  submit = async () => {
    this.setState({ submitStatus: 'pending' });

    try {
      const { data: { prediction } } = await axios.get('/submit', {
        params: {
          url: this.state.url,
        },
      });

      this.setState({
        result: prediction,
        submitStatus: 'success',
      });
    } catch (e) {
      console.log(e);
      this.setState({ submitStatus: 'error' });
    }
  }

  render() {
    const { submitStatus, result } = this.state;
    return (
      <div>
        <Segment>
          <Label as="a" color="orange" ribbon style={{ marginBottom: '1rem' }}>Submit</Label>
          <div className="scrollable-section about-section-info">
            <Header as="h2" style={{ marginBottom: 32 }}>
              Are we missing a source?
            </Header>

            <p className="tutu-description" >
              Please insert a Source URL or an Article URL to be checked by the fake news checker
            </p>

            <Input
              placeholder="Article URL"
              className="submit-field"
              onChange={(_, { value }) => this.setState({ url: value })}
            />

            <Button
              color="blue"
              floated="right"
              circular
              onClick={this.submit}
            >
              Submit
            </Button>

            <Message info>
              <Message.Header>
                {submitStatus === 'pending' ? 'please wait...' : ''}
                {submitStatus === 'success' ? result : ''}
                {submitStatus === 'error' ? 'error' : ''}
              </Message.Header>
            </Message>
          </div>
        </Segment>
      </div>
    );
  }
}

export default Submit;
