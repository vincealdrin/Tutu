import React, { Component } from 'react';
import { List, Image, Label, Dimmer, Modal, Segment, Grid, Header, Button } from 'semantic-ui-react';
import shortid from 'shortid';
import RelatedArticles from './RelatedArticles';
import Carousel from './Carousel';
import Tags from './Tags';
import Reactions from './Reactions';
import Pagination from './Pagination';
import newsPlaceholder from '../../assets/placeholder/news-placeholder.png';
import './styles.css';
import { crudStatus } from '../../utils';

class ClusterModal extends Component {
  state = {
    currentPage: 1,
    limit: 10,
  };

  getSentimentColor = (sentiment) => {
    if (sentiment === 'Positive') {
      return 'green';
    } else if (sentiment === 'Neutral') {
      return 'grey';
    }
    return 'red';
  }

  render() {
    const {
      currentPage,
      limit,
    } = this.state;
    const {
      articles,
      totalCount,
      open,
      removeFocused,
      updateReaction,
      status,
      fetchArticles,
      reactionStatus,
      reactionId,
    } = this.props;
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
          {status.pending ? (
            <Dimmer active inverted>
              <Header as="h4">Loading articles...</Header>
            </Dimmer>
          ) : null}
          {articles.map(({
            sentiment,
            summary,
            title,
            publishDate,
            source,
            sourceUrl,
            id,
            url,
            topImageUrl,
            reactions,
            authors = [],
            categories = [],
            keywords = [],
            organizations = [],
            people = [],
            relatedArticles = [],
          }) => (
            <Segment key={shortid.generate()} raised className="modal-article-container">
              <Grid columns={2}>
                <Grid.Column width={11} style={{ position: 'relative' }}>
                  <Label color={colors[Math.floor(Math.random() * colors.length)]} ribbon className="news-label">{source}</Label>
                  <div className="image-tag-title-container">
                    <div className="top-image">
                      <Image src={topImageUrl || newsPlaceholder} />
                      <Header as="a" href={url} color="blue" className="news-title" target="_blank">{title}</Header>
                      <p className="article-date">
                        {new Date(publishDate).toDateString()} {status.success && authors.length > 0 ? ` | ${authors.join(', ')}` : ''}
                      </p>
                    </div>
                    <div className="tags">
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
                      <Reactions
                        reactions={reactions}
                        status={reactionId === id ? reactionStatus : crudStatus}
                        updateReaction={(reaction) => updateReaction(id, reaction)}
                      />
                    </div>
                  </div>
                </Grid.Column>
                <Grid.Column width={5}>
                  <div className="news-summary">
                    <Carousel content={summary} />
                  </div>
                  <div className="related-stories">
                    <RelatedArticles content={relatedArticles} />
                  </div>
                </Grid.Column>
              </Grid>
            </Segment>
            ))}
        </Modal.Content>
        <Modal.Actions>
          {((open && status.success) || articles.length) && totalCount > limit ? (
            <Pagination
              currentPage={currentPage || 1}
              totalPages={Math.ceil((totalCount || limit) / limit) || 1}
              onChange={(page) => {
                this.setState({ currentPage: page });
                fetchArticles(null, page - 1, limit);
              }}
            />
          ) : null}
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ClusterModal;
