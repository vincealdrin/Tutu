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
} from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
import FocusedSimpleMarker from './FocusedSimpleMarker';
import SimpleMarker2 from './SimpleMarker2';
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
    fetchFocusedInfoStatus: infoStatus,
    fetchFocusedClusterInfoStatus: clusterInfoStatus,
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
}, dispatch);

const mapOption = {
  zoomControl: false,
  fullscreenControl: false,
  minZoom: 6,
  maxZoom: 12,
  styles: mapStyle,
  gestureHandling: 'greedy',
};

const K_MARGIN_TOP = 30;
const K_MARGIN_RIGHT = 30;
const K_MARGIN_BOTTOM = 30;
const K_MARGIN_LEFT = 30;

const K_HOVER_DISTANCE = 30;

class MapView extends PureComponent {
  defaultCenter = {
    lat: 14.84438951326129,
    lng: 121.64467285156252,
  }

  _onChange = ({
    center, zoom,
    bounds, marginBounds,
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
    // <ReactMapGL
    //   mapboxApiAccessToken="pk.eyJ1Ijoidm5jZWNhYiIsImEiOiJjajIydnljYXcwMDB3MzNsb2djODdoYTNhIn0.u4LykI1u90a98Fd7VJ77Vw"
    //   {...mapState}
    //   showZoomControls
    //   width={1000}
    //   height={1000}
    //   onChangeViewport={(a) => {
    //     this.props.onChangeViewport(a);
    //   }}
    // >
    //   {showFocused ? (
    //     <FocusedSimpleMarker
    //       removeFocused={this.props.removeFocused}
    //       status={fetchFocusedInfoStatus}
    //       article={focusedInfo}
    //       lng={focusedInfo.lng}
    //       lat={focusedInfo.lat}
    //     />
    // ) : null}

    //   {clusters.map(({
    //       wx, wy, numPoints, points,
    //     }) => {
    //     if (numPoints === 1) {
    //       const article = articles[points[0].id];
    //       return article.locations.map(({ lng, lat }) => {
    //         const isNotFocused = focusedKey !== `${article.url}-${lng}-${lat}`;

    //         if (isNotFocused) {
    //           return (
    //             <SimpleMarker
    //               key={shortid.generate()}
    //               status={fetchFocusedInfoStatus}
    //               title={article.title}
    //               publishDate={article.publishDate}
    //               source={article.source}
    //               sourceUrl={article.sourceUrl}
    //               url={article.url}
    //               lng={lng}
    //               lat={lat}
    //             />
    //           );
    //         }

    //         return null;
    //       });
    //     }

    //     const ids = points.map((point) => point.id);
    //     return (
    //       <ClusterMarker
    //         key={shortid.generate()}
    //         clusters={clusters}
    //         articles={articles.filter((_, i) => ids.includes(i))}
    //         count={numPoints}
    //         lng={wx}
    //         lat={wy}
    //       />
    //     );
    //   })}
    // </ReactMapGL>
      <GoogleMapReact
        defaultZoom={6}
      // defaultCenter={this.defaultCenter}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={mapOption}
        margin={[K_MARGIN_TOP, K_MARGIN_RIGHT, K_MARGIN_BOTTOM, K_MARGIN_LEFT]}
        center={mapState.center}
        zoom={mapState.zoom}
        hoverDistance={K_HOVER_DISTANCE}
        onChange={this._onChange}
        onChildClick={this._onChildClick}
      >
        {/* {showFocusedSimple ? (
          <FocusedSimpleMarker
            removeFocused={this.props.removeFocused}
            status={infoStatus}
            article={focusedInfo}
            lng={focusedInfo.lng}
            lat={focusedInfo.lat}
          />
        ) : null} */}
        <ClusterModal
          open={focusedOn === 'cluster'}
          articles={focusedClusterInfo}
          removeFocused={this.props.removeFocused}
        />
        <SimpleModal
          open={focusedOn === 'simple'}
          article={focusedInfo}
          removeFocused={this.props.removeFocused}
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

