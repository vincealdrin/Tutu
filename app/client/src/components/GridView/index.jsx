import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NProgress } from 'redux-nprogress';
import { Button, Message, Dimmer, Loader, Header } from 'semantic-ui-react';
import InfiniteScroll from 'react-infinite-scroller';
import {
  fetchArticles,
  fetchFocusedInfo,
  toggleSourcesType,
  clearState,
} from '../../modules/mapArticles';
import { openModal } from '../../modules/insights';
import MapInterface from '../Common/MapInterface';
import ArticlesGrid from './ArticlesGrid';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    isCredible,
    totalCount,
    fetchStatus,
    focusedOn,
  },
}) => ({
  articles,
  isCredible,
  totalCount,
  fetchStatus,
  focusedOn,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  toggleSourcesType,
  clearState,
  openModal,
}, dispatch);

class GridView extends Component {
  state = {
    limit: 9,
    page: 0,
  }

  componentDidMount() {
    const { page, limit } = this.state;
    this.props.fetchArticles(limit, page);
  }

  render() {
    const {
      articles,
      totalCount,
      fetchStatus,
      focusedOn,
      history: { location, push },
      isCredible,
    } = this.props;
    const { page, limit } = this.state;
    const hasMore = page * limit < totalCount;
    const isMap = !/grid/.test(location.pathname);

    return (
      <div className="grid-view-container">
        <MapInterface
          isMap={isMap}
          isCredible={isCredible}
          status={fetchStatus}
          focusedOn={focusedOn}
          openInsights={this.props.openModal}
          fetchArticles={() => {
            this.props.fetchArticles(limit, 0, () => {
              this.setState({ page: 0 });
            }, true);
          }}
          onSourcesTypeToggle={(isSidebarVisible) => {
            this.props.toggleSourcesType();
            this.props.fetchArticles(limit, 0, () => {
              this.setState({ page: 0 });
            }, true);

            if (isSidebarVisible) {
              this.props.fetchRecentArticles();
              this.props.fetchPopularArticles();
            }
          }}
          onViewToggle={() => {
            this.props.clearState();
            push('/');
          }}
        />
        <InfiniteScroll
          pageStart={page}
          loadMore={() => {
            if (!fetchStatus.pending && hasMore) {
              const newPage = page + 1;
              this.props.fetchArticles(limit, newPage, () => {
								this.setState({ page: newPage });
              });
						}
          }}
          hasMore={hasMore}
          initialLoad={false}
          useWindow={false}
        >
          <ArticlesGrid
            articles={articles}
            fetchArticle={this.props.fetchFocusedInfo}
          />
          {fetchStatus.pending && hasMore ? (
            <Dimmer page active>
              <Loader inverted>LOADING...</Loader>
            </Dimmer>
          ) : (
            <Header textAlign="center" className="no-more-articles">NO MORE ARTICLES TO SHOW</Header>
          )}
        </InfiniteScroll>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(GridView);

