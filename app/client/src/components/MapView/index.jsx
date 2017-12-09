import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import { fetchArticles, fetchFocusedInfo, removeFocusedInfo, updateMapState } from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
import FocusedSimpleMarker from './FocusedSimpleMarker';
import SimpleMarker2 from './SimpleMarker2';
import ClusterMarker from './ClusterMarker';
import mapStyle from './mapStyle.json';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    fetchStatus,
    mapState,
    relatedArticles,
    fetchFocusedInfoStatus,
    focusedInfo,
    focusedKey,
  },
}) => ({
  articles,
  clusters,
  fetchStatus,
  mapState,
  relatedArticles,
  fetchFocusedInfoStatus,
  focusedInfo,
  focusedKey,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  removeFocusedInfo,
  updateMapState,
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
    const {
      ne, nw,
      se, sw,
    } = bounds;

    const upperRight = nw.lat > 24.742282253941596 || nw.lng > 118.0181546020508;
    const upperLeft = ne.lat > 24.742282253941596 || ne.lng > 123.7804837036133;
    if (upperRight || upperLeft) {
      // console.log(this.defaultCenter);
      this.props.updateMapState({
        lat: 14.413869136504943,
        lng: 120.6329006958008,
      }, zoom, bounds);
    } else {
      console.log('not lagpas');
      this.props.updateMapState(center, zoom, bounds);
      this.props.fetchArticles();
    }
  }

  _onChildClick = (_, childProps) => {
    const { focusedKey } = this.props;
    if (!childProps.clusters) {
      const key = `${childProps.url}-${childProps.lng}-${childProps.lat}`;

      if (focusedKey !== key) {
        this.props.fetchFocusedInfo(childProps);
      }
    }
  }

  render() {
    const {
      articles,
      clusters,
      mapState,
      focusedInfo,
      fetchFocusedInfoStatus,
      focusedKey,
    } = this.props;
    const showFocused = !fetchFocusedInfoStatus.pending && fetchFocusedInfoStatus.success && focusedKey;

    return (
      <GoogleMapReact
        defaultZoom={7}
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
        {showFocused ? (
          <FocusedSimpleMarker
            removeFocusedInfo={this.props.removeFocusedInfo}
            status={fetchFocusedInfoStatus}
            article={focusedInfo}
            lng={focusedInfo.lng}
            lat={focusedInfo.lat}
          />
        ) : null}

        {clusters.map(({
              wx, wy, numPoints, points,
            }) => {
            if (numPoints === 1) {
              const article = articles[points[0].id];
              return article.locations.map(({ lng, lat }) => {
                const isNotFocused = focusedKey !== `${article.url}-${lng}-${lat}`;

                if (isNotFocused) {
                  return (
                    <SimpleMarker
                      key={shortid.generate()}
                      status={fetchFocusedInfoStatus}
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

                return null;
              });
            }

            const ids = points.map((point) => point.id);
            return (
              <ClusterMarker
                key={shortid.generate()}
                clusters={clusters}
                articles={articles.filter((_, i) => ids.includes(i))}
                count={numPoints}
                lng={wx}
                lat={wy}
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

