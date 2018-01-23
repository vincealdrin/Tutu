import React, { Component } from 'react';
import axios from 'axios';
import {
  Segment,
  Label,
  Header,
  Input,
  Button,
  Message,
  Checkbox,
} from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    submitStatus: '',
    errorMessage: '',
    submitSource: true,
    result: {
      overallPred: false,
      isReliable: true,
      isVerified: false,
      result: 0,
      sourceResult: 0,
      contentResult: 0,
      sourceUrl: '',
    },
    url: '',
  };

  submit = async () => {
    const { url, submitSource } = this.state;
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
          sourceUrl,
        },
      } = await axios.get('/submit', {
        params: {
          submit: submitSource,
          url,
        },
      });

      this.setState({
        result: {
          isReliable,
          isVerified,
          pct,
          sourcePct,
          contentPct,
          overallPred,
          sourceUrl,
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
    const {
      submitStatus,
      result,
      errorMessage,
      submitSource,
    } = this.state;

    return (
      <div>
        <Segment>
          <Label as="a" color="orange" ribbon style={{ marginBottom: '1rem' }}>Submit</Label>
          <div className="scrollable-section about-section-info">
            <Header as="h2" style={{ marginBottom: 32 }}>
              Analyze Source&#x27;s Credibility
            </Header>

            <p className="tutu-description" >
              Please insert any Article URL from the source to be analyze by our trained model
            </p>

            <Input
              placeholder="Article URL"
              className="submit-field"
              onChange={(_, { value }) => this.setState({ url: value })}
            />

            <Checkbox
              label="Submit source to be verified by journalists"
              onChange={() => {
                this.setState({ submitSource: !submitSource });
              }}
              checked={submitSource}
            />

            <Button
              color="blue"
              floated="right"
              circular
              onClick={this.submit}
            >
              Submit
            </Button>

            <h5>Our analyzer accuracy improves everytime you submit a source</h5>

            <Message color={result.isReliable ? 'green' : 'red'} info>
              <Message.Header>
                {submitStatus === 'pending' ? 'Analyzing...' : ''}
                {submitStatus === 'success' ? (
                  <span>
                    {!result.isVerified
                      ? (
                        <div>
                          Result:
                          <ul>
                            {/* <li>overall prediction: {result.overallPred ? 'RELIABLE' : 'NOT RELIABLE'}</li>
                            <li />
                            <li />
                            <li /> */}
                            <li>Source: <a href={result.sourceUrl} target="_blank">{result.sourceUrl}</a></li>
                            <li>Prediction: {result.isReliable ? 'CREDIBLE' : 'NOT CREDIBLE'}</li>
                            <li>Credibility score: ({result.pct.toFixed(2)}%)</li>
                            <li />
                            <li>Source Credibility Score: ({result.sourcePct.toFixed(2)}%)</li>
                            <li>Content Credibility Score: ({result.contentPct.toFixed(2)}%)</li>
                          </ul>
                        </div>
                      )
                      : (
                        <div>
                          <a href={result.sourceUrl} target="_blank">{result.sourceUrl}</a>
                          <br />is a {result.isReliable ? 'CREDIBLE' : 'NOT CREDIBLE'} SOURCE
                        </div>
                      )}

                    <h4> {result.isVerified ? 'This result was verified by a journalist' : 'NOTE: This result was not verified by a journalist and it might not be accurate'}</h4>
                  </span>
                ) : ''}

                {submitStatus === 'error' ? errorMessage.code || errorMessage : ''}
              </Message.Header>
            </Message>
          </div>
        </Segment>
      </div>
    );
  }
}

export default Submit;
