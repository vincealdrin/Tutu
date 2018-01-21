import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NProgress } from 'redux-nprogress';
import { Icon, Input, Button, Message } from 'semantic-ui-react';
import {
  fetchBoundArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  toggleSourcesType,
} from '../../modules/mapArticles';
import { fetchRecentArticles } from '../../modules/recentArticles';
import { fetchPopularArticles } from '../../modules/popularArticles';
import ClusterModal from './ClusterModal';
import Insights from '../Insights';
import AppSidebar from '../AppSidebar';
import SimpleModal from './SimpleModal';
import Map from './Map';
import './styles.css';
import '../../index.css'

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    mapState,
    filterMapState,
    isCredible,
  },
}) => ({
  // mapState: map.viewport.toJS(),
  mapState,
  articles,
  clusters,
  filterMapState,
  isCredible,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBoundArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  toggleSourcesType,
  fetchRecentArticles,
  fetchPopularArticles,
}, dispatch);


class MapView extends Component {
  state = {
    currentPosition: null,
    isSidebarWiden: false,
    isSidebarVisible: false,
    isMsgShown: true,
  }

  componentDidMount() {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      this.setState({
        currentPosition: {
          lat: coords.latitude,
          lng: coords.longitude,
        },
      });
    });
  }

  getTopBtnClassName = () => {
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

  _onChange = ({ center, zoom, marginBounds }) => {
    this.props.updateMapState(center, zoom, marginBounds);

    this.props.fetchBoundArticles();
  }

  _onChildClick = (_, childProps) => {
    if (childProps.articles) {
      this.props.fetchFocusedClusterInfo(childProps.articles);
    } else {
      this.props.fetchFocusedInfo(childProps.article);
    }
  }

  render() {
    const {
      articles,
      clusters,
      mapState,
      isCredible,
    } = this.props;
    const {
      currentPosition,
      isSidebarVisible,
      isSidebarWiden,
      isMsgShown,
    } = this.state;

    return (
      <div className="map-container">
        <div className="show-on-mobile">
          <Button size="large" circular color='red' icon='newspaper' className="fake-news-button-mobile" />
          <Button size="large" circular color='default' icon='bar chart' className="insights-button-mobile" />
        </div>
        <div className="hide-when-mobile">
          <div className={`map-top-buttons ${this.getTopBtnClassName()}`}>
            <Button
              content={`${isCredible ? 'Not Credible' : 'Credible'} Sources`}
              color={`${isCredible ? 'red' : 'green'}`}
              icon="newspaper"
              labelPosition="left"
              onClick={() => {
                this.setState({ isMsgShown: true });
                this.props.toggleSourcesType();
                this.props.fetchBoundArticles();

                if (isSidebarVisible) {
                  this.props.fetchRecentArticles();
                  this.props.fetchPopularArticles();
                }
              }}
            />
            <Insights />
          </div>
          <Input className="search-box" icon>
            <input id="searchBoxInput" placeholder="Search places" />
            <Icon name="search" />
          </Input>
          {currentPosition ? (
            <Button
              className="current-loc"
              icon="crosshairs"
              onClick={() => {
                this.props.updateMapState(currentPosition, 12);
              }}
              circular
            />
          ) : null}
        </div>
          {isMsgShown ? (
            <Message
              header={`Map of ${isCredible ? 'Credible' : 'Not Credible'} Sources`}
              content={`Each marker contains news from ${isCredible ? 'credible' : 'not credible'} sources`}
              className="src-type-message"
              onDismiss={this.closeMessage}
            />
          ) : null}
          <NProgress />
          <ClusterModal />
          <SimpleModal />
          <AppSidebar
            isWide={isSidebarWiden}
            isVisible={isSidebarVisible}
            showSidebarContent={this.showSidebarContent}
            toggleSidebarContent={this.toggleSidebarContent}
            expandSidebar={this.expandSidebar}
            shrinkSidebar={this.shrinkSidebar}
          />
        <Map
          mapState={mapState}
          clusters={clusters}
          articles={articles}
          updateMapState={this.props.updateMapState}
          onChange={this._onChange}
          onChildClick={this._onChildClick}
          isCredible={isCredible}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

