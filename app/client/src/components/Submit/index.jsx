import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Segment, Label, Header, Input, Button, Message } from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    submitStatus: '',
    result: {
      isReliable: false,
      isVerified: false,
      pct: {},
    },
    url: '',
  };

  submit = async () => {
    this.setState({ submitStatus: 'pending' });

    try {
      const { data: { isReliable, isVerified, result } } = await axios.get('/submit', {
        params: {
          url: this.state.url,
        },
      });

      this.setState({
        result: {
          isReliable,
          isVerified,
          pct: result,
        },
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
              Please insert an Article URL to be checked by the fake news checker
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
                {submitStatus === 'success' ? (
                  <span>
                    Result:
                    <ul>
                      <li>prediction: {result.isReliable ? 'RELIABLE' : 'NOT RELIABLE'}</li>
                      <li>reliable ({result.pct.reliable.toFixed(2)}%)</li>
                      <li>not reliable ({result.pct.notReliable.toFixed(2)}%)</li>
                      <li>Source</li>
                      <ul>
                        <li>reliable ({result.pct.source.reliable.toFixed(2)}%)</li>
                        <li>not reliable ({result.pct.source.notReliable.toFixed(2)}%)</li>
                      </ul>
                      <li>Content</li>
                      <ul>
                        <li>reliable ({result.pct.content.reliable.toFixed(2)}%)</li>
                        <li>not reliable ({result.pct.content.notReliable.toFixed(2)}%)</li>
                      </ul>
                    </ul>

                    <p> {result.isVerified ? 'verified by journalists' : 'not verified by journalists tho'}</p>
                  </span>
                ) : ''}
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
