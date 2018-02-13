import React, { Component } from 'react';
import {
  Button,
  Modal,
  Header,
  Icon,
  TextArea,
  Form,
} from 'semantic-ui-react';

class ActionButton extends Component {
  state = { text: '' }

  render() {
    const {
      url,
      isCredible,
      onClick,
      vote,
    } = this.props;
    const urlName = url.replace(/https?:\/\//, '');
    const label = isCredible ? 'CREDIBLE' : 'NOT CREDIBLE';
    const voteBtnColor = vote && vote.isCredible && isCredible ? 'green' : 'red';
    const btnColor = isCredible ? 'green' : 'red';
    const hasVoted = vote !== null;

    return (
      <Modal
        trigger={<Button color={vote ? voteBtnColor : null} content={label} />}
        size="small"
        basic
      >
        <Header
          icon="tag"
          content={
            hasVoted
              ? (
                <span>
                You tagged <a href={url} target="_blank">{urlName}</a> as <span style={{ color: isCredible ? '#21ba45' : '#ff695e' }}>{label}</span> news source
                </span>
              )
              : (
                <span>
                Are you sure you want to tag <a href={url} target="_blank">{urlName}</a> as <span style={{ color: isCredible ? '#21ba45' : '#ff695e' }}>{label}</span> news source?
                </span>
              )
        }
        />
        <Modal.Content>
          {hasVoted
            ? (
              <div>
                <h3>Your comment:</h3>
                <p>awe</p>
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
                color={btnColor}
                onClick={() => onClick(this.state.text)}
                inverted
              >
                <Icon name={isCredible ? 'check circle' : 'warning sign'} /> Yes, I will tag {urlName} as {label} news source
              </Button>
            )
            : (
              <Button onClick={onClick} inverted >
                <Icon name="undo" /> I want to UNTAG {urlName} as {label} news source
              </Button>
            )}
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ActionButton;
