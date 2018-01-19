import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { NProgress } from 'redux-nprogress';
import { Icon, Input, Button } from 'semantic-ui-react';
import {
  fetchBoundArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
} from '../../modules/mapArticles';
import ClusterModal from './ClusterModal';
import Insights from '../Insights';
import AppSidebar from '../AppSidebar';
import SimpleModal from './SimpleModal';
import Map from './Map';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    mapState,
    filterMapState,
  },
}) => ({
  // mapState: map.viewport.toJS(),
  mapState,
  articles,
  clusters,
  filterMapState,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchBoundArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
}, dispatch);


class MapView extends Component {
  state = {
    currentPosition: null,
    isSidebarWiden: false,
    isSidebarVisible: false,
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

  expandSidebar = () => this.setState({ isSidebarWiden: true })
  shrinkSidebar = () => this.setState({ isSidebarWiden: false })
  showSidebarContent = () => this.setState({ isSidebarVisible: true })
  toggleSidebarContent = () => this.setState({ isSidebarVisible: !this.state.isSidebarVisible })

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

  render() {
    const {
      articles,
      clusters,
      mapState,
    } = this.props;
    const {
      currentPosition,
      isSidebarVisible,
      isSidebarWiden,
    } = this.state;

    return (
      <div className="map-container">
        <div className={`map-top-buttons ${this.getTopBtnClassName()}`} >
          <Button
            content="Go to legitimate news"
            icon="newspaper"
            labelPosition="left"
          />
          <Insights />
        </div>
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

        <Map
          mapState={mapState}
          clusters={clusters}
          articles={articles}
          updateMapState={this.props.updateMapState}
          onChange={this._onChange}
          onChildClick={this._onChildClick}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

