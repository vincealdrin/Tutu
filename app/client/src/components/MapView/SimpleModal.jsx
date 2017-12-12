import React, { Component } from 'react';
import { List, Image, Label, Modal, Accordion, Icon, Grid, Header, Button } from 'semantic-ui-react';
import { Tooltip } from 'react-tippy';
import shortid from 'shortid';
// import the reaction images
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
    visible: false,
  };
  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const {
      activeIndex,
      visible,
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

    if (status.pending && open) {
      console.log('pending');
      return 'pending';
    }

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
          <Grid columns={2} style={{ marginBottom: '1rem' }}>
            <Grid.Column width={7}>
              <div className="image-tag-title-container">
                <div className="top-image">
                  <Image src={topImageUrl} />
                </div>
              </div>
            </Grid.Column>
            <Grid.Column width={9}>
              <div>
                <List divided relaxed>
                  <List.Item>
                    <Label as="a" className="tag-label">Categories</Label>
                    {categories.map((category) => (
                      <span key={shortid.generate()} className="article-tags">{`${category}, `}</span>
                    ))}
                  </List.Item>
                  <List.Item>
                    <Label as="a" className="tag-label">Keywords</Label>
                    {visible ?
                      keywords.map((keyword) => (
                        <span key={shortid.generate()} className="article-tags">{`${keyword}, `}</span>
                      )) :
                      keywords.slice(0, 2).map((keyword) => (
                        <span key={shortid.generate()} className="article-tags">{`${keyword}, `}</span>
                    ))}
                    <span color="blue" className="article-tags see-more" onClick={this.toggleVisibility}>{`${visible ? 'See Less' : 'See More...'}`}</span>
                  </List.Item>
                  <List.Item>
                    <Label as="a" className="tag-label">Sentiment</Label>
                    <span className="article-tags">{sentiment}</span>
                  </List.Item>
                  <List.Item>
                    <Label as="a" className="tag-label">Organizations</Label>
                    {organizations.slice(0, 2).map((org) => (
                      <span key={shortid.generate()} className="article-tags">{`${org}, `}</span>
                    ))}
                  </List.Item>
                  <List.Item>
                    <Label as="a" className="tag-label">People</Label>
                    {people.map((pips) => (
                      <span key={shortid.generate()} className="article-tags">{`${pips}, `}</span>
                    ))}
                  </List.Item>
                </List>
              </div>
            </Grid.Column>
          </Grid>
          <Header as="a" color="blue" href={url} target="_blank">{title}</Header>
          <p className="article-date">
            {new Date(publishDate).toDateString()} | {authors.join(', ')}
          </p>
          <p> {summary && summary[0]} </p>
          <Accordion style={{ margin: '1rem 0' }}>
            <Accordion.Title active={activeIndex === 0} index={0}>
              <Icon name="dropdown" />
              Related Stories
            </Accordion.Title>
            <Accordion.Content active={activeIndex === 0} index={0}>
              {relatedArticles.map((related) => (
                <p>{related}</p>
              ))}
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
                    <Image src={reactionItem.image} onClick={() => updateReaction(url, reactionItem.name)} />
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
