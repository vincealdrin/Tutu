import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  Dimmer,
  Modal,
  Header,
  List,
  Label,
  Segment,
  Grid,
} from 'semantic-ui-react';
import moment from 'moment';
import shortid from 'shortid';
import { removeFocused, fetchFocusedClusterInfo } from '../../modules/mapArticles';
import Pagination from './Pagination';
import Tags from './Tags';
import Reactions from './Reactions';
import RelatedArticles from './RelatedArticles';
import { DATE_FORMAT } from '../../constants';
import { getSentimentColor } from '../../utils';
import ImagePlaceholder from '../Common/ImagePlaceholder';

const mapStateToProps = ({
  mapArticles: {
    focusedOn,
    clusterStatus,
    focusedClusterInfo,
    focusedClusterArticles,
    isCredible,
  },
}) => ({
  isOpen: focusedOn === 'cluster'
    && ((!clusterStatus.cancelled && clusterStatus.success) || clusterStatus.pending),
  status: clusterStatus,
  articles: focusedClusterInfo,
  totalCount: focusedClusterArticles.length,
  isCredible,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  removeFocused,
  fetchFocusedClusterInfo,
}, dispatch);

class ClusterModal extends PureComponent {
  state = {
    currentPage: 1,
    limit: 10,
  };

  render() {
    const {
      articles,
      totalCount,
      isOpen,
      status,
      isCredible,
    } = this.props;
    const {
      currentPage,
      limit,
    } = this.state;

    return (
      <Modal
        className="modal-container"
        open={isOpen}
        onClose={() => {
          this.props.removeFocused();
          this.setState({ currentPage: 1 });
        }}
        closeIcon
        closeOnDimmerClick
        dimmer
      >
        <Modal.Content scrolling>
          {status.pending ? (
            <Dimmer active inverted>
              <Header as="h4">Loading articles...</Header>
            </Dimmer>
          ) : null}
          {articles.map((article) => (
            <Segment
              key={shortid.generate()}
              className="modal-article-container"
              raised
            >
              <Grid columns={3} stackable>
                <Label
                  as="a"
                  target="_blank"
                  className="news-label"
                  color="orange"
                  href={article.sourceUrl}
                  ribbon
                >
                  <div className="news-label-name">{article.source}</div>
                </Label>
                <Grid.Column width={4} style={{ position: 'relative' }}>
                  <div className="image-tag-title-container">
                    <div className="top-image">
                      <ImagePlaceholder src={article.topImageUrl} />
                      <Header as="a" href={article.url} color="blue" className="news-title" target="_blank">{article.title}</Header>
                      <p className="article-date">
                        {moment(article.publishDate).format(DATE_FORMAT)} {article.authors.length > 0 ? ` | ${article.authors.join(', ')}` : ''}
                      </p>
                    </div>
                  </div>
                </Grid.Column>
                <Grid.Column width={6}>
                  <div className="tags">
                    <List divided relaxed>
                      <List.Item>
                        <Label
                          as="a"
                          className="tag-label"
                          color={getSentimentColor(article.sentiment)}
                        >
                          Sentiment
                        </Label>
                        <span className="article-tags">{article.sentiment}</span>
                      </List.Item>
                      <List.Item>
                        <Label as="a" className="tag-label">Categories</Label>
                        <Tags content={article.categories} />
                      </List.Item>
                      <List.Item>
                        <Label as="a" className="tag-label">Keywords</Label>
                        <Tags content={article.keywords} />
                      </List.Item>
                      <List.Item>
                        <Label as="a" className="tag-label">Organizations</Label>
                        <Tags content={article.organizations} />
                      </List.Item>
                      <List.Item>
                        <Label as="a" className="tag-label">People</Label>
                        <Tags content={article.people} />
                      </List.Item>
                    </List>
                    <Reactions
                      reactions={article.reactions}
                      id={article.id}
                    />
                  </div>
                </Grid.Column>
                <Grid.Column width={6}>
                  <div className="news-summary">
                    {article.summary}
                  </div>
                  <div className="related-stories">
                    <RelatedArticles
                      relatedArticles={article.relatedArticles.articles}
                      credibleArticles={article.relatedArticles.credibleArticles}
                      isCredible={isCredible}
                    />
                  </div>
                </Grid.Column>
              </Grid>
            </Segment>
          ))}
        </Modal.Content>
        <Modal.Actions>
          {((isOpen && status.success) || articles.length) && totalCount > limit ? (
            <Pagination
              currentPage={currentPage || 1}
              totalPages={Math.ceil((totalCount || limit) / limit) || 1}
              onChange={(page) => {
                this.setState({ currentPage: page });
                this.props.fetchFocusedClusterInfo(null, page - 1, limit);
              }}
            />
          ) : null}
        </Modal.Actions>
      </Modal>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ClusterModal);

