import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NProgress } from 'redux-nprogress';
import { Icon, Input, Button, Message, Menu } from 'semantic-ui-react';
import {
  fetchArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  toggleSourcesType,
  clearState,
} from '../../modules/mapArticles';
import { fetchRecentArticles } from '../../modules/recentArticles';
import { fetchPopularArticles } from '../../modules/popularArticles';
import ClusterModal from './ClusterModal';
import Insights from '../Insights';
import AppSidebar from '../AppSidebar';
import SimpleModal from './SimpleModal';
import Map from './Map';
import tutuLogo from '../../assets/logo/tutu-logo.png';
import './styles.css';
import '../../index.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    mapState,
    isCredible,
    focusedOn,
    fetchStatus,
  },
}) => ({
  // mapState: map.viewport.toJS(),
  mapState,
  articles,
  clusters,
  isCredible,
  focusedOn,
  fetchStatus,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  toggleSourcesType,
  fetchRecentArticles,
  fetchPopularArticles,
  clearState,
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

  _onChange = ({ center, zoom, marginBounds }) => {
    this.props.updateMapState(center, zoom, marginBounds);

    this.props.fetchArticles();
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
      focusedOn,
      history: { location, push },
      fetchStatus,
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
          <Menu fixed="top" borderless>
            <Menu.Item>
              <img src={tutuLogo} className="mobile-tutu-logo"/>
            </Menu.Item>   
            <Menu.Item header className="mobile-tutu-title">TUTÛ</Menu.Item>
            <Menu.Menu position='right'>
              <Menu.Item>
                <Input icon className="search-topbar-mobile">
                  <input id="searchBoxInput" placeholder="Search places" />
                  <Icon name="search" />
                </Input>
                {currentPosition ? (
                  <Button
                    className="current-loc-mobile"
                    icon="crosshairs"
                    onClick={() => {
                      this.props.updateMapState(currentPosition, 12);
                    }}
                    circular
                  />
                ) : null}
              </Menu.Item>
            </Menu.Menu>
          </Menu>
          <Button 
            size="large" 
            circular 
            icon="newspaper" 
            className="fake-news-button-mobile" 
            color={`${isCredible ? 'red' : 'green'}`}
            onClick={() => {
              this.setState({ isMsgShown: true });
              this.props.toggleSourcesType();
              this.props.fetchArticles();

              if (isSidebarVisible) {
                this.props.fetchRecentArticles();
                this.props.fetchPopularArticles();
              }
            }}
          />
          <Button size="large" circular color="blue" icon="bar chart" className="insights-button-mobile" />
          <Button 
            size="large" 
            circular 
            color="default" 
            className="grid-button-mobile" 
            icon={location.pathname === '/' ? 'grid layout' : 'map'}
              onClick={() => {
                this.props.clearState();
                push('/grid/');
              }}
            />
        </div>
        <div className="hide-when-mobile">
          <div className={`map-top-buttons ${this.getBtnsClassName()}`}>
            {fetchStatus.success ? <Insights /> : null}
            <Button
              content={`${isCredible ? 'Not Credible' : 'Credible'} Sources`}
              color={`${isCredible ? 'red' : 'green'}`}
              icon="newspaper"
              labelPosition="left"
              onClick={() => {
                this.setState({ isMsgShown: true });
                this.props.toggleSourcesType();
                this.props.fetchArticles();

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
                push('/grid/');
              }}
            />
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
        {focusedOn === 'simple' ? <SimpleModal /> : null}
        {focusedOn === 'cluster' ? <ClusterModal /> : null}
        <AppSidebar
          isWide={isSidebarWiden}
          isVisible={isSidebarVisible}
          showSidebarContent={this.showSidebarContent}
          toggleSidebarContent={this.toggleSidebarContent}
          expandSidebar={this.expandSidebar}
          shrinkSidebar={this.shrinkSidebar}
          fetchArticles={this.props.fetchArticles}
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

