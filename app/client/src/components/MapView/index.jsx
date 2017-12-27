import React, { PureComponent, Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import {
  fetchArticles,
  fetchFocusedInfo,
  removeFocused,
  updateMapState,
  fetchFocusedClusterInfo,
  updateReaction,
  updateFilterMapState,
} from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
import { HOVER_DISTANCE, MAX_ZOOM, MIN_ZOOM, DEFAULT_ZOOM } from '../../constants';
import ClusterMarker from './ClusterMarker';
import ClusterModal from './ClusterModal';
import SimpleModal from './SimpleModal';
import mapStyle from './mapStyle.json';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    clusterStatus,
    articles,
    clusters,
    fetchStatus,
    mapState,
    relatedArticles,
    infoStatus,
    focusedInfo,
    focusedClusterInfo,
    filterMapState,
    focusedOn,
    focusedClusterArticles,
  },
}) => ({
  // mapState: map.viewport.toJS(),
  mapState,
  articles,
  clusters,
  fetchStatus,
  relatedArticles,
  infoStatus,
  clusterStatus,
  filterMapState,
  focusedInfo,
  focusedClusterInfo,
  focusedClusterArticles,
  focusedOn,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  removeFocused,
  updateFilterMapState,
  updateMapState,
  fetchFocusedClusterInfo,
  updateReaction,
}, dispatch);

const mapOption = {
  zoomControl: false,
  fullscreenControl: false,
  minZoomOverride: true,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  styles: mapStyle,
  gestureHandling: 'greedy',
};

class MapView extends Component {
  componentDidMount() {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      this.props.updateMapState({
        lat: coords.latitude,
        lng: coords.longitude,
      }, 11);
    });
  }

  _onChange = ({ center, zoom, bounds }) => {
    this.props.updateFilterMapState(center, zoom, bounds);
    this.props.fetchArticles(center, zoom, bounds);
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
      infoStatus,
      clusterStatus,
      focusedClusterInfo,
      focusedOn,
      focusedInfo,
      focusedClusterArticles,
    } = this.props;

    return (
      <GoogleMapReact
        defaultZoom={DEFAULT_ZOOM}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={mapOption}
        // defaultCenter={mapState.center}
        center={mapState.center}
        zoom={mapState.zoom}
        hoverDistance={HOVER_DISTANCE}
        onChange={this._onChange}
        onChildClick={this._onChildClick}
      >
        <ClusterModal
          open={focusedOn === 'cluster' && !clusterStatus.cancelled}
          articles={focusedClusterInfo}
          fetchArticles={fetchFocusedClusterInfo}
          removeFocused={this.props.removeFocused}
          updateReaction={this.props.updateReaction}
          status={clusterStatus}
          totalCount={focusedClusterArticles.length}
        />
        <SimpleModal
          open={focusedOn === 'simple' && !infoStatus.cancelled}
          article={focusedInfo}
          removeFocused={this.props.removeFocused}
          updateReaction={this.props.updateReaction}
          status={infoStatus}
        />

        {clusters.map(({
            wx: lng, wy: lat, numPoints, points,
          }) => {
          if (numPoints === 1) {
            const article = articles[points[0].id];
            return (
              <SimpleMarker
                key={shortid.generate()}
                article={article}
                lng={lng}
                lat={lat}
              />
            );
          }

          const ids = points.map((point) => point.id);
          return (
            <ClusterMarker
              key={shortid.generate()}
              articles={articles.filter((_, i) => ids.includes(i))}
              count={numPoints}
              lng={lng}
              lat={lat}
            />
          );
        })}

      </GoogleMapReact>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

