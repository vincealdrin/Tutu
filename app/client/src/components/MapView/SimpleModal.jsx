import React, { Component } from 'react';
import { Popup, List, Image, Label, Modal, Segment, Grid, Header, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class SimpleModal extends Component {
  render() {
    const {
      open,
      article: {
        authors,
        categories,
        keywords,
        organizations,
        people,
        reactions = [],
        sentiment,
        summary,
        topImageUrl,
        relatedArticles,
        title,
        publishDate,
        source,
        sourceUrl,
        url,
      },
      removeFocused,
      updateReaction,
      status,
    } = this.props;

    if (status.pending && open) {
      console.log('pending');
      return 'pending';
    }

    const [
      afraid = { reduction: 0 },
      amused = { reduction: 0 },
      angry = { reduction: 0 },
      happy = { reduction: 0 },
      inspired = { reduction: 0 },
      sad = { reduction: 0 },
    ] = reactions;

    return (
      <Modal
        className="modal-container"
        open={open}
        onClose={removeFocused}
        closeOnDimmerClick
        dimmer
      >
        <Modal.Content scrolling>
          {title}
          reactions:
          happy - {happy.reduction}
          sad - {sad.reduction}
          angry - {angry.reduction}
          amused - {amused.reduction}
          afraid - {afraid.reduction}
          inspired - {inspired.reduction}
          <Button
            onClick={() => updateReaction(url, 'happy')}
            content="happy"
          />
        </Modal.Content>
      </Modal>
    );
  }
}

export default SimpleModal;
