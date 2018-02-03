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
  Icon,
} from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    submitStatus: '',
    errorMessage: '',
    submitSource: true,
    result: {
      overallPred: false,
      isCredible: true,
      verifiedRes: {},
      isVerified: false,
      result: 0,
      sourceResult: 0,
      contentResult: 0,
      sourceUrl: '',
    },
    showPrediction: true,
    url: '',
  };

  submit = async () => {
    const { url, submitSource } = this.state;
    this.setState({ submitStatus: 'pending', showPrediction: false });

    try {
      const {
        data: {
          isCredible,
          isVerified,
          verifiedRes,
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
          isCredible,
          isVerified,
          verifiedRes,
          pct,
          sourcePct,
          contentPct,
          overallPred,
          sourceUrl,
        },
        showPrediction: !isVerified,
        submitStatus: 'success',
        errorMessage: '',
      });
    } catch (e) {
      this.setState({
        submitStatus: 'error',
        errorMessage: e.response.data.message || '',
      });
    }
  }

  render() {
    const {
      submitStatus,
      result,
      errorMessage,
      submitSource,
      showPrediction,
    } = this.state;

    return (
      <Segment className="submit-segment-container">
        <Label as="a" color="orange" ribbon style={{ marginBottom: '1rem' }}>Detect</Label>
        <div className="submit-scrollable-section">
          <Header as="h2" style={{ marginBottom: 32 }}>
              Detect News Source&apos;s Credibility
          </Header>

          <p className="tutu-description" >
              Please insert any Article URL from the source to be analyzed by our trained model to see if they are similar to known not credible news sources.
          </p>

          <Input
            placeholder="Article URL"
            className="submit-field"
            onChange={(_, { value }) => this.setState({ url: value })}
          />

          <Checkbox
            label="Submit news source to be verified by journalists"
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

          <h5>You help us improve our detector&#39;s accuracy everytime you submit a source</h5>

          {submitStatus ? (

            <div>
              {submitStatus === 'pending' ? (
                <Message color="yellow" info>
                  <Message.Header>
                    <Icon name="circle notched" loading />
                      Analyzing...
                  </Message.Header>
                </Message>
                ) : null}

              {submitStatus === 'success' && result.isVerified ? (
                <Message color={result.verifiedRes.isCredible ? 'green' : 'red'} info>
                  <Message.Header>
                    <p>
                      <Icon name={result.isCredible ? 'check' : 'warning sign'} />
                      <a href={result.sourceUrl} target="_blank">{result.sourceUrl}</a>
                      <br />is tagged by a professional journalist as a <b>{result.isCredible ? 'CREDIBLE' : 'NOT CREDIBLE'} SOURCE</b>
                    </p>
                    <Button
                      content={`I ${showPrediction ? 'DON\'T' : 'STILL'} WANNA SEE THE PREDICTION`}
                      onClick={() => {
                          this.setState({ showPrediction: !showPrediction });
                        }}
                    />
                  </Message.Header>
                </Message>
                ) : null}

              {submitStatus === 'success' && result.isVerified && showPrediction ? (
                <Message color={result.isCredible ? 'green' : 'red'} info>
                  <Message.Header>
                    <span>
                      <div>
                          Prediction Result:
                          <br /><Icon name={result.isCredible ? 'check' : 'warning sign'} />
                        <a href={result.sourceUrl} target="_blank">{result.sourceUrl}</a>
                        <br />is <b>{result.isCredible ? 'A CREDIBLE' : 'NOT A CREDIBLE'} SOURCE</b>
                        <p>Credibility score: ({result.pct.toFixed(2)}%)</p>
                      </div>
                      <h4>NOTE: This result was not verified by a journalist and it might not be accurate</h4>
                    </span>
                  </Message.Header>
                </Message>
                ) : null}

              <h2 style={{ color: 'red' }}>{submitStatus === 'error' ? errorMessage.code || errorMessage : ''}</h2>
            </div>
            ) : null}
        </div>
      </Segment>
    );
  }
}

export default Submit;
