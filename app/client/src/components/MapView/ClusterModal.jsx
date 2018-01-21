import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  List,
  Image,
  Label,
  Dimmer,
  Modal,
  Segment,
  Grid,
  Header,
} from 'semantic-ui-react';
import shortid from 'shortid';
import moment from 'moment';
import RelatedArticles from './RelatedArticles';
import { removeFocused, fetchFocusedClusterInfo } from '../../modules/mapArticles';
import Tags from './Tags';
import Reactions from './Reactions';
import Pagination from './Pagination';
import topImgPlaceholder from '../../assets/placeholder/top-img-placeholder.png';
import './styles.css';
import { DATE_FORMAT } from '../../constants';

const mapStateToProps = ({
  mapArticles: {
    focusedOn,
    clusterStatus,
    focusedClusterInfo,
    focusedClusterArticles,
  },
}) => ({
  isOpen: focusedOn === 'cluster' && !clusterStatus.cancelled,
  status: clusterStatus,
  articles: focusedClusterInfo,
  totalCount: focusedClusterArticles.length,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  removeFocused,
  fetchFocusedClusterInfo,
}, dispatch);

class ClusterModal extends PureComponent {
  state = {
    currentPage: 1,
    limit: 10,
    brokenImgs: [],
  };

  handleImgError = (id) => {
    this.setState({
      brokenImgs: [
        ...this.state.brokenImgs,
        id,
      ],
    });
  }

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
      articles,
      totalCount,
      isOpen,
      status,
    } = this.props;
    const {
      currentPage,
      limit,
      brokenImgs,
    } = this.state;

    return (
      <Modal
        className="modal-container"
        open={isOpen}
        onClose={() => {
          this.props.removeFocused();
          this.setState({ currentPage: 1 });
        }}
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
              <Grid columns={3} stackable>
                  <Label
                    as="a"
                    target="__blank"
                    className="news-label"
                    color="orange"
                    href={sourceUrl}
                    ribbon
                  >
                    <div className="news-label-name">{source}</div>
                  </Label>
                <Grid.Column width={4} style={{ position: 'relative' }}>
                  <div className="image-tag-title-container">
                    <div className="top-image">
                      <Image
                        src={
                          brokenImgs.includes(id)
                            ? topImgPlaceholder
                            : topImageUrl || topImgPlaceholder
                        }
                        onError={() => this.handleImgError(id)}
                      />
                      <Header as="a" href={url} color="blue" className="news-title" target="_blank">{title}</Header>
                      <p className="article-date">
                        {moment(publishDate).format(DATE_FORMAT)} {status.success && authors.length > 0 ? ` | ${authors.join(', ')}` : ''}
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
                      id={id}
                    />
                  </div>
                </Grid.Column>
                <Grid.Column width={6}>
                  <div className="news-summary">
                    {summary}
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

