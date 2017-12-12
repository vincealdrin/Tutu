import React, { Component } from 'react';
import { List, Image, Label, Modal, Segment, Grid, Header, Button, Accordion, Icon } from 'semantic-ui-react';
import shortid from 'shortid';
import './styles.css';

class ClusterModal extends Component {
  state = { activeIndex: 0 };
  handleClick = (_, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  }

  render() {
    const { activeIndex } = this.state;
    const {
      articles,
      open,
      removeFocused,
      updateReaction,
      status,
    } = this.props;
    const colors = ['red', 'orange', 'yellow', 'green', 'blue'];

    if (status.pending && open) {
      console.log('pending');
      return 'pending';
    }

    return (
      <Modal
        className="modal-container"
        open={open}
        onClose={removeFocused}
        closeOnDimmerClick
        dimmer
      >
        <Modal.Content scrolling>
          {articles.map(({
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
          }) => {
            const [
              afraid = { reduction: 0 },
              amused = { reduction: 0 },
              angry = { reduction: 0 },
              happy = { reduction: 0 },
              inspired = { reduction: 0 },
              sad = { reduction: 0 },
            ] = reactions;

              return (
                <Segment key={shortid.generate()} raised className="modal-article-container">
                  <Grid columns={2}>
                    <Grid.Column width={11}>
                      <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{source}</Label>
                      <div className="image-tag-title-container">
                        <div className="top-image">
                          <Image src={topImageUrl} />
                          <Header as="a" href={url} color="blue" className="news-title" target="_blank">{title}</Header>
                          <p className="article-date">
                            {new Date(publishDate).toDateString()} | &nbsp;
                            {authors.join(', ')}
                          </p>
                        </div>
                        <div className="tags">
                          <List divided relaxed>
                            <List.Item>
                              <Label as="a" className="tag-label">Categories</Label>
                              {categories.map((category) => (
                                <span key={shortid.generate()} className="article-tags">{`${category}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Keywords</Label>
                              {keywords.map((keyword) => (
                                <span key={shortid.generate()} className="article-tags">{`${keyword}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Sentiment</Label>
                              <span className="article-tags">{sentiment}</span>
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Organizations</Label>
                              {organizations.map((org) => (
                                <span key={shortid.generate()} className="article-tags">{`${org}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">People</Label>
                              {people.map((person) => (
                                <span key={shortid.generate()} className="article-tags">{`${person}, `}</span>
                              ))}
                            </List.Item>
                          </List>
                        </div>
                      </div>
                    </Grid.Column>
                    <Grid.Column width={5}>
                      <div className="news-summary">
                        <p> {summary && summary[0]} </p>
                      </div>
                      <div className="related-stories">
                        <Accordion style={{ margin: '1rem 0' }}>
                          <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                            <Icon name="dropdown" />
                            Related Stories
                          </Accordion.Title>
                          <Accordion.Content active={activeIndex === 0}>
                            {relatedArticles.map((related) => <p>{related.title}</p>)}
                          </Accordion.Content>
                        </Accordion>
                        <Button as="a" href={url} circular color="blue" target="_blank" className="article-read-more">Read More</Button>
                      </div>
                    </Grid.Column>
                  </Grid>
                </Segment>
            );
          })}
        </Modal.Content>
      </Modal>
    );
  }
}

export default ClusterModal;
