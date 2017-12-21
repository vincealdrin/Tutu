import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, Label, Header, Input, Button, Message } from 'semantic-ui-react';
import './styles.css';

class Submit extends Component {
  state = {
    success: false,
  };
  submit = () => {
    this.setState({ success: !this.state.success });
  }
  render() {
    const { success } = this.state;
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

            <Input placeholder="Source URL" className="submit-field" />
            <Input placeholder="Article URL" className="submit-field" />

            <Button
              color="blue"
              floated="right"
              circular
              onClick={this.submit}
            >
              Submit
            </Button>

            <Message info className={success ? 'doThis' : 'dontDoThis'}>
              <Message.Header>
                Submission Success!
              </Message.Header>
              <p>
                inquirer.net will be added to our sources after being reviewed. Thank you for your contribution.
              </p>
            </Message>
          </div>
        </Segment>
      </div>
    );
  }
}

export default Submit;
