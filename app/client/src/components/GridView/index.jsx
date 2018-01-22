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
import AppSidebar from '../AppSidebar';
import SimpleModal from '../MapView/SimpleModal';
import Insights from '../Insights';
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
}, dispatch);

class GridView extends Component {
  state = {
    isSidebarWiden: false,
    isSidebarVisible: false,
    limit: 9,
    page: 0,
    isMsgShown: true,
  }

  componentDidMount() {
    const { page, limit } = this.state;
    this.props.fetchArticles(limit, page);
  }


  getBtnsClassName = () => {
    const {
      isSidebarVisible,
      isSidebarWiden,
    } = this.state;

    if (isSidebarVisible && isSidebarWiden) {
      return 'adjust-top-buttons-widen-visible';
    }

    if (isSidebarVisible) {
      return 'adjust-top-buttons-visible';
    }

    if (isSidebarWiden) {
      return 'adjust-top-buttons-widen';
    }

    return '';
  }

  expandSidebar = () => this.setState({ isSidebarWiden: true })
  shrinkSidebar = () => this.setState({ isSidebarWiden: false })
  showSidebarContent = () => this.setState({ isSidebarVisible: true })
  toggleSidebarContent = () => this.setState({ isSidebarVisible: !this.state.isSidebarVisible })
  closeMessage = () => this.setState({ isMsgShown: false })

  render() {
    const {
      articles,
      totalCount,
      fetchStatus,
      focusedOn,
      history: { location, push },
      isCredible,
    } = this.props;
    const {
      isSidebarVisible,
      isSidebarWiden,
      limit,
      page,
      isMsgShown,
    } = this.state;
    const hasMore = page * limit < totalCount;

    return (
      <div className="grid-view-container">
        {focusedOn === 'simple' ? <SimpleModal /> : null}
        <NProgress />
        <div className={`map-top-buttons ${this.getBtnsClassName()}`}>
          <Insights />
          <Button
            content={`${isCredible ? 'Not Credible' : 'Credible'} Sources`}
            color={`${isCredible ? 'red' : 'green'}`}
            icon="newspaper"
            labelPosition="left"
            onClick={() => {
              this.setState({ isMsgShown: true });
              this.props.toggleSourcesType();
              this.props.fetchArticles(limit, 0, () => {
                this.setState({ page: 0 });
              }, true);

              if (isSidebarVisible) {
                this.props.fetchRecentArticles();
                this.props.fetchPopularArticles();
              }
            }}
          />
        </div>
        <div className={`map-bot-buttons ${this.getBtnsClassName()}`}>
          <Button
            labelPosition="left"
            content={location.pathname === '/' ? 'Grid View' : 'Map View'}
            icon={location.pathname === '/' ? 'grid layout' : 'map'}
            onClick={() => {
              this.props.clearState();
              push('/');
            }}
          />
        </div>
        <AppSidebar
          isWide={isSidebarWiden}
          isVisible={isSidebarVisible}
          showSidebarContent={this.showSidebarContent}
          toggleSidebarContent={this.toggleSidebarContent}
          expandSidebar={this.expandSidebar}
          shrinkSidebar={this.shrinkSidebar}
          fetchArticles={() => {
            this.props.fetchArticles(limit, 0, () => {
              this.setState({ page: 0 });
            }, true);
          }}
          hideCount
        />
        {isMsgShown ? (
          <Message
            header={`Grid of ${isCredible ? 'Credible' : 'Not Credible'} Sources`}
            content={`Each card contains news from ${isCredible ? 'credible' : 'not credible'} sources`}
            className="src-type-message"
            onDismiss={this.closeMessage}
          />
        ) : null}
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

