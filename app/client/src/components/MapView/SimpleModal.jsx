import React, { Component } from 'react';
import { List, Image, Dimmer, Loader, Label, Modal, Accordion, Icon, Grid, Header, Button } from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import Carousel from 'nuka-carousel';
import shortid from 'shortid';
// import the reaction images
import Tags from './Tags';
import happyReact from './reactions/5.svg';
import amusedReact from './reactions/4.svg';
import inspiredReact from './reactions/3.svg';
import afraidReact from './reactions/2.svg';
import sadReact from './reactions/1.svg';
import angryReact from './reactions/0.svg';
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
    }
    return 'red';
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
        topImageUrl,
        authors = [],
        categories = [],
        keywords = [],
        organizations = [],
        people = [],
        reactions = [],
        relatedArticles = [],
      },
      removeFocused,
      updateReaction,
      status,
    } = this.props;

    const reactionsImages = [
      { image: happyReact, name: 'happy' },
      { image: amusedReact, name: 'amused' },
      { image: inspiredReact, name: 'inspired' },
      { image: afraidReact, name: 'afraid' },
      { image: sadReact, name: 'sad' },
      { image: angryReact, name: 'angry' },
    ];

    const [
      afraid = { reduction: 0 },
      amused = { reduction: 0 },
      angry = { reduction: 0 },
      happy = { reduction: 0 },
      inspired = { reduction: 0 },
      sad = { reduction: 0 },
    ] = reactions;

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
        <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{source}</Label>
        <Modal.Content scrolling>
          {status.pending ? (
            <Dimmer active>
              <Loader indeterminate>Loading article...</Loader>
            </Dimmer>
            ) : null }
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
              <div>
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
              </div>
            </Grid.Column>
          </Grid>
          <Header as="a" color="blue" href={url} target="_blank">{title}</Header>
          <p className="article-date">
            {new Date(publishDate).toDateString()}
            &nbsp;{status.success && authors.length > 0 ? ` | ${authors.join(', ')}` : ''}
          </p>
          <Label as="a" href={`http://${sourceUrl}`} target="_blank" circular style={{ marginBottom: '0.6rem' }}>{source}</Label>
          <Carousel style={{ padding: '18px 70px 60px', textAlign: 'center' }}>
            {summary && summary.map((sum) => (
              <p> {sum} </p>
            ))}
          </Carousel>
          <Accordion style={{ margin: '1rem 0' }}>
            <Accordion.Title active={activeIndex === 0} index={0} onClick={this.showRelatedArticles}>
              <Icon name="dropdown" />
              Related Stories
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0} index={0}>
              <List divided relaxed>
                {relatedArticles.length > 0
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
            <List horizontal>
              {reactionsImages.map((reactionItem) => (
                <List.Item className="reactions">
                  <Tooltip
                    html={
                      <span style={{ textTransform: 'capitalize' }}>{reactionItem.name}</span>
                    }
                    distance={-4}
                  >
                    <Image
                      src={reactionItem.image}
                      onClick={() => updateReaction(url, reactionItem.name)}
                    />
                  </Tooltip>
                </List.Item>
            ))}
            </List>
            <Button as="a" href={url} circular color="blue" target="_blank">Read More</Button>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

export default SimpleModal;
