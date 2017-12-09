import React, { Component } from 'react';
import { Popup, List, Image, Label, Modal, Segment, Grid, Header, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class SimpleModal extends Component {
  render() {
    const { open, article, removeFocused } = this.props;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    return (
      <Modal
        className="modal-container"
        open={open}
        onClose={removeFocused}
        closeOnDimmerClick
        dimmer
      >
        <Modal.Content scrolling>
          {article.title}
        </Modal.Content>
      </Modal>
    );
  }
}

export default SimpleModal;
