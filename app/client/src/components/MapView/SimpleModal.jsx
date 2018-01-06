import React, { Component } from 'react';
import {
  List,
  Image,
  Dimmer,
  Label,
  Modal,
  Accordion,
  Icon,
  Grid,
  Header,
  Button,
} from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import Tags from './Tags';
import Carousel from './Carousel';
import Reactions from './Reactions';
import './styles.css';

class SimpleModal extends Component {
  state = {
    activeIndex: 0,
  };

  getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') {
      return 'green';
    } else if (sentiment === 'Neutral') {
      return 'grey';
    } else if (sentiment === 'Negative') {
      return 'red';
    }

    return '';
  }

  showRelatedArticles = (_, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }

  render() {
    const {
      activeIndex,
    } = this.state;
    const {
      open,
      article: {
        sentiment,
        summary,
        title,
        publishDate,
        source,
        sourceUrl,
        url,
        id,
        topImageUrl,
        reactions = {
          happy: 0,
          sad: 0,
          afraid: 0,
          amused: 0,
          angry: 0,
          inspired: 0,
        },
        authors = [],
        categories = [],
        keywords = [],
        organizations = [],
        people = [],
        relatedArticles = [],
      },
      removeFocused,
      updateReaction,
      status,
      reactionStatus,
    } = this.props;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    return (
      <Modal
        className="modal-container"
        size="tiny"
        open={open}
        onClose={removeFocused}
        closeOnDimmerClick
        dimmer
      >
        {status.success ? (
          <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{source}</Label>
        ) : null}
        <Modal.Content scrolling>
          {status.pending ? (
            <Dimmer active inverted>
              <Header as="h4">Loading article...</Header>
            </Dimmer>
          ) : null}
          <Grid columns={2} style={{ marginBottom: '1rem' }}>
            <Grid.Column width={7}>
              <div className="image-tag-title-container">
                <div
                  className="top-image"
                  style={{
                    width: 219.63,
                    height: 294.84,
                    backgroundImage: `url(${topImageUrl})`,
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                  }}
                />
              </div>
            </Grid.Column>
            <Grid.Column width={9}>
              <List divided relaxed>
                <List.Item>
                  <Label
                    as="a"
                    className="tag-label"
                    color={this.getSentimentColor(sentiment)}
                  >
                      Sentiment
                  </Label>
                  <span className="article-tags">{sentiment}</span>
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Categories</Label>
                  <Tags content={categories} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Keywords</Label>
                  <Tags content={keywords} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">Organizations</Label>
                  <Tags content={organizations} />
                </List.Item>
                <List.Item>
                  <Label as="a" className="tag-label">People</Label>
                  <Tags content={people} />
                </List.Item>
              </List>
            </Grid.Column>
          </Grid>
          <Header as="a" color="blue" href={url} target="_blank">{title}</Header>
          <p className="article-date">
            {new Date(publishDate).toDateString()}
            &nbsp;{status.success && authors.length > 0 ? ` | ${authors.join(', ')}` : ''}
          </p>
          <Label as="a" href={`http://${sourceUrl}`} target="_blank" circular style={{ marginBottom: '0.6rem' }}>{source}</Label>
          <div className="carousel-container">
            <Carousel content={summary} />
          </div>
          <Accordion style={{ margin: '1rem 0' }}>
            <Accordion.Title active={activeIndex === 0} index={0} onClick={this.showRelatedArticles}>
              <Icon name="dropdown" />
              Related Stories
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0} index={0}>
              <List divided relaxed>
                {relatedArticles.length
                  ? relatedArticles.map((related) => (
                    <List.Item>
                      <List.Header
                        as="a"
                        color="blue"
                        href={related.url}
                        target="_blank"
                      >
                        {related.title}
                      </List.Header>
                    </List.Item>
                  ))
                  : <span className="no-info">No related articles found</span>
                }
              </List>
            </Accordion.Content>
          </Accordion>
          <div className="extras">
            <Reactions
              reactions={reactions}
              status={reactionStatus}
              updateReaction={(reaction) => updateReaction(id, reaction)}
            />
            <Button
              as="a"
              href={url}
              circular
              color="blue"
              target="_blank"
              className="read-more-button"
            >
              Read More
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

export default SimpleModal;
