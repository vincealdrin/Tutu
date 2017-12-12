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
          {articles.map((article) =>
              (
                <Segment key={shortid.generate()} raised className="modal-article-container">
                  <Grid columns={2}>
                    <Grid.Column width={11}>
                      <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{article.source}</Label>
                      <div className="image-tag-title-container">
                        <div className="top-image">
                          <Image src={article.topImageUrl} />
                          <Header as="a" href={article.url} color="blue" className="news-title" target="_blank">{article.title}</Header>
                          <p className="article-date">
                            {new Date(article.publishDate).toDateString()} | {article.authors.map((author) => (
                                                                                `${author}, `
                                                                              ))}
                          </p>
                        </div>
                        <div className="tags">
                          <List divided relaxed>
                            <List.Item>
                              <Label as="a" className="tag-label">Categories</Label>
                              {article.categories.map((category) => (
                                <span key={shortid.generate()} className="article-tags">{`${category}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Keywords</Label>
                              {article.keywords.map((keyword) => (
                                <span key={shortid.generate()} className="article-tags">{`${keyword}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Sentiment</Label>
                              <span className="article-tags">{article.sentiment}</span>
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">Organizations</Label>
                              {article.organizations.map((org) => (
                                <span key={shortid.generate()} className="article-tags">{`${org}, `}</span>
                              ))}
                            </List.Item>
                            <List.Item>
                              <Label as="a" className="tag-label">People</Label>
                              {article.people.map((pips) => (
                                <span key={shortid.generate()} className="article-tags">{`${pips}, `}</span>
                              ))}
                            </List.Item>
                          </List>
                        </div>
                      </div>
                    </Grid.Column>
                    <Grid.Column width={5}>
                      <div className="news-summary">
                        <p>
                          {article.summary[0]}
                        </p>
                      </div>
                      <div className="related-stories">
                        <Accordion style={{ margin: '1rem 0' }}>
                          <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                            <Icon name="dropdown" />
                            Related Stories
                          </Accordion.Title>
                          <Accordion.Content active={activeIndex === 0}>
                            {article.relatedArticles.map((related) => (
                              <p>{related}</p>
                            ))}
                          </Accordion.Content>
                        </Accordion>

                        <Button as="a" href={article.url} circular color="blue" target="_blank" className="article-read-more">Read More</Button>
                      </div>
                    </Grid.Column>
                  </Grid>
                </Segment>
            ))}
        </Modal.Content>
      </Modal>
    );
  }
}

export default ClusterModal;
