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
  Dropdown,
  Icon,
  Button,
  Divider,
} from 'semantic-ui-react';
import moment from 'moment';
import shortid from 'shortid';
import { removeFocused, fetchFocusedClusterInfo } from '../../modules/mapArticles';
import Pagination from './Pagination';
import Tags from './Tags';
import Reactions from './Reactions';
import RelatedArticles from './RelatedArticles';
import { DATE_FORMAT } from '../../constants';
import { getSentimentColor, mapOptions } from '../../utils';
import ImagePlaceholder from '../Common/ImagePlaceholder';

const sortOptions = [
  { key: 'Publish Date (latest to oldest)', text: 'Publish Date (latest to oldest)', value: 'publishDate-DESC' },
  { key: 'Publish Date (oldest to latest)', text: 'Publish Date (oldest to latest)', value: 'publishDate-ASC' },
  { key: 'Popularity (high to low)', text: 'Popularity (high to low)', value: 'popularity-DESC' },
  { key: 'Popularity (low to high)', text: 'Popularity (low to high)', value: 'popularity-ASC' },
];

const mapStateToProps = ({
  mapArticles: {
    focusedOn,
    clusterStatus,
    focusedClusterInfo,
    focusedClusterTotalCount,
    isCredible,
  },
}, { isMobile }) => ({
  isOpen: focusedOn === 'cluster'
    && ((!clusterStatus.cancelled && clusterStatus.success) || clusterStatus.pending),
  status: clusterStatus,
  articles: focusedClusterInfo,
  totalCount: focusedClusterTotalCount,
  isCredible,
  isMobile,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  removeFocused,
  fetchFocusedClusterInfo,
}, dispatch);

const initState = {
  currentPage: 1,
  limit: 10,
  keywords: [],
  isDesc: true,
  sort: 'publishDate-DESC',
  sortText: 'Publish Date (latest to oldest)',
};

class ClusterModal extends PureComponent {
  state = initState;

  render() {
    const {
      articles,
      totalCount,
      isOpen,
      status,
      isCredible,
      isMobile,
    } = this.props;
    const {
      currentPage,
      limit,
      isDesc,
      keywords,
      sort,
      sortText,
    } = this.state;

    return (
      <Modal
        className="modal-container"
        open={isOpen}
        onClose={() => {
          this.props.removeFocused();
          this.setState(initState);
        }}
        closeIcon
        closeOnDimmerClick
        dimmer
      >
        <Modal.Description>
          <Grid>
            <Grid.Column width={9}>
              <Dropdown
                className="icon"
                icon="sort"
                value={sort}
                options={sortOptions}
                onChange={(_, { value }) => {
                  this.setState({
                    sort: value,
                    sortText: sortOptions.find((opt) => opt.value === value).text,
                    currentPage: 0,
                  }, () => {
                    this.props.fetchFocusedClusterInfo(null, {
                      page: 0,
                      sort: value,
                      limit,
                      keywords,
                    });
                  });
                }}
                text={`Sort by: ${sortText}`}
                button
                floating
                labeled
                search
              />
            </Grid.Column>
            <Grid.Column width={7}>
              <Dropdown
                placeholder="Search"
                icon="search"
                noResultsMessage="Add keyword"
                options={keywords.map(mapOptions)}
                value={keywords}
                onChange={(_, { value }) => {
                  this.setState({ keywords: value }, () => {
                    this.props.fetchFocusedClusterInfo(null, {
                      page: 0,
                      limit,
                      isDesc,
                      keywords: value,
                    });
                  });
                }}
                search
                selection
                fluid
                multiple
                allowAdditions
              />

            </Grid.Column>
          </Grid>
        </Modal.Description>
        <Divider />
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
                <Grid.Column width={4}>
                  <ImagePlaceholder
                    src={article.topImageUrl}
                    style={{ maxHeight: 127, marginBottom: 3 }}
                    imgClass="top-img-portrait"
                  />
                  <Header
                    as="a"
                    color="blue"
                    className="news-title"
                    target="_blank"
                    href={article.url}
                  >
                    {article.title}
                  </Header>
                  <p className="article-date">
                    {moment(article.publishDate).format(DATE_FORMAT)} {article.authors.length > 0 ? ` | ${article.authors.join(', ')}` : ''}
                  </p>
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
              siblingPagesRange={isMobile ? 0 : 1}
              hideFirstAndLastPageLinks={isMobile}
              hidePreviousAndNextPageLinks={isMobile}
              onChange={(page) => {
                this.setState({ currentPage: page });
                this.props.fetchFocusedClusterInfo(null, {
                  page: page - 1,
                  limit,
                  keywords,
                  isDesc,
                });
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

