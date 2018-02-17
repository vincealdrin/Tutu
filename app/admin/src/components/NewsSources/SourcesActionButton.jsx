import React, { Component } from 'react';
import {
  Button,
  Modal,
  Header,
  Icon,
  TextArea,
  Form,
} from 'semantic-ui-react';

class SourcesActionButton extends Component {
  state = { text: '' }

  render() {
    const {
      url,
      onClick,
      hasVoted,
      comment,
    } = this.props;
    const urlName = url.replace(/https?:\/\//, '');

    return (
      <Modal
        trigger={<Button color={hasVoted ? 'blue' : null} content="REVOTE" />}
        size="small"
        basic
      >
        <Header
          icon="tag"
          content={
            hasVoted
              ? (
                <span>
                  You asked other journalists for a REVOTE for <a href={url} target="_blank">{urlName}</a>
                </span>
              )
              : (
                <span>
                  Are you sure you want to ask for a REVOTE for <a href={url} target="_blank">{urlName}</a>?
                </span>
              )
          }
        />
        <Modal.Content>
          {hasVoted
            ? (
              <div>
                <h3>Your comment:</h3>
                <p>{comment}</p>
              </div>
            )
            : (
              <div>
                Comment:
                <Form style={{ width: '100%' }}>
                  <TextArea
                    placeholder={`Something you can comment about ${urlName}`}
                    onChange={(_, { value: text }) => this.setState({ text })}
                  />
                </Form>
              </div>
            )}
        </Modal.Content>
        <Modal.Actions>
          {!hasVoted
            ? (
              <Button
                onClick={() => onClick(this.state.text)}
                inverted
              >
                <Icon name="thumbs up" /> Yes, I want to ask for a REVOTE for {urlName}
              </Button>
            )
            : (
              <Button onClick={onClick} inverted>
                <Icon name="undo" /> I DON&apos;T WANT A REVOTE for {urlName}
              </Button>
            )}
        </Modal.Actions>
      </Modal>
    );
  }
}

export default SourcesActionButton;
