import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import ReactMapGL from 'react-map-gl';
import { onChangeViewport } from 'redux-map-gl';
import shortid from 'shortid';
import {
  fetchArticles,
  fetchFocusedInfo,
  removeFocused,
  updateMapState,
  fetchFocusedClusterInfo,
  updateReaction,
} from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
import { HOVER_DISTANCE, MAX_ZOOM, MIN_ZOOM } from '../../constants';
import ClusterMarker from './ClusterMarker';
import ClusterModal from './ClusterModal';
import SimpleModal from './SimpleModal';
import mapStyle from './mapStyle.json';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    fetchStatus,
    mapState,
    relatedArticles,
    infoStatus,
    clusterStatus: clusterInfoStatus,
    focusedInfo,
    focusedClusterInfo,
    focusedOn,
  },
  map,
}) => ({
  // mapState: map.viewport.toJS(),
  mapState,
  articles,
  clusters,
  fetchStatus,
  relatedArticles,
  infoStatus,
  clusterInfoStatus,
  focusedInfo,
  focusedClusterInfo,
  focusedOn,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  removeFocused,
  updateMapState,
  onChangeViewport,
  fetchFocusedClusterInfo,
  updateReaction,
}, dispatch);

const mapOption = {
  zoomControl: false,
  fullscreenControl: false,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  styles: mapStyle,
  gestureHandling: 'greedy',
};

class MapView extends PureComponent {
  _onChange = ({
    center, zoom,
    bounds,
  }) => {
    this.props.updateMapState(center, zoom, bounds);
    this.props.fetchArticles();
  }

  _onChildClick = (_, childProps) => {
    if (childProps.articles) {
      this.props.fetchFocusedClusterInfo(childProps.articles);
    } else {
      this.props.fetchFocusedInfo(childProps);
    }
  }

  render() {
    const {
      articles,
      clusters,
      mapState,
      infoStatus,
      clusterInfoStatus,
      focusedClusterInfo,
      focusedOn,
      focusedInfo,
    } = this.props;

    return (
      <GoogleMapReact
        defaultZoom={6}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={mapOption}
        center={mapState.center}
        zoom={mapState.zoom}
        hoverDistance={HOVER_DISTANCE}
        onChange={this._onChange}
        onChildClick={this._onChildClick}
      >
        <ClusterModal
          open={focusedOn === 'cluster'}
          articles={focusedClusterInfo}
          removeFocused={this.props.removeFocused}
          updateReaction={this.props.updateReaction}
          status={clusterInfoStatus}
        />
        <SimpleModal
          open={focusedOn === 'simple'}
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
                title={article.title}
                publishDate={article.publishDate}
                source={article.source}
                sourceUrl={article.sourceUrl}
                url={article.url}
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

