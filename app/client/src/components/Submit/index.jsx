import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Segment, Label, Header, Input, Button, Message } from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    submitStatus: '',
    errorMessage: '',
    result: {
      overallPred: false,
      isReliable: false,
      isVerified: false,
      result: 0,
      sourceResult: 0,
      contentResult: 0,
    },
    url: '',
  };

  submit = async () => {
    this.setState({ submitStatus: 'pending' });

    try {
      const {
        data: {
          isReliable,
          isVerified,
          sourcePct,
          contentPct,
          pct,
          overallPred,
        },
      } = await axios.get('/submit', {
        params: { url: this.state.url },
      });

      this.setState({
        result: {
          isReliable,
          isVerified,
          pct,
          sourcePct,
          contentPct,
          overallPred,
        },
        submitStatus: 'success',
        errorMessage: '',
      });
    } catch (e) {
      this.setState({
        submitStatus: 'error',
        errorMessage: e.response.data.message,
      });
    }
  }

  render() {
    const { submitStatus, result, errorMessage } = this.state;
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
                      <li>overall prediction: {result.overallPred ? 'RELIABLE' : 'NOT RELIABLE'}</li>
                      <li />
                      <li />
                      <li />
                      <li>prediction: {result.isReliable ? 'RELIABLE' : 'NOT RELIABLE'}</li>
                      <li>reliability ({result.pct.toFixed(2)}%)</li>
                      <li />
                      <li>source reliability ({result.sourcePct.toFixed(2)}%)</li>
                      <li>content reliability ({result.contentPct.toFixed(2)}%)</li>
                    </ul>

                    <p> {result.isVerified ? 'verified by journalists' : 'not verified by journalists tho'}</p>
                  </span>
                ) : ''}
                {submitStatus === 'error' ? errorMessage : ''}
              </Message.Header>
            </Message>
          </div>
        </Segment>
      </div>
    );
  }
}

export default Submit;
