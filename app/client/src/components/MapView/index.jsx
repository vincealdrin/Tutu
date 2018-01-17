import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import { NProgress } from 'redux-nprogress';
import { Icon, Input, Button } from 'semantic-ui-react';
import {
  fetchArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  updateFilterMapState,
} from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
import {
  MARGIN_TOP,
  MARGIN_RIGHT,
  MARGIN_BOTTOM,
  MARGIN_LEFT,
  HOVER_DISTANCE,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_ZOOM,
} from '../../constants';
import ClusterMarker from './ClusterMarker';
import ClusterModal from './ClusterModal';
import SimpleModal from './SimpleModal';
import mapStyle from './mapStyle.json';
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
  fetchArticles,
  fetchFocusedInfo,
  updateFilterMapState,
  updateMapState,
  fetchFocusedClusterInfo,
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
  state = { currentPosition: null }

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

  _onChange = ({
    center,
    zoom,
    marginBounds,
  }) => {
    this.props.updateFilterMapState(center, zoom, marginBounds);
    this.props.updateMapState(center, zoom, marginBounds);
    this.props.fetchArticles(center, zoom, marginBounds);
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
    } = this.props;
    const {
      currentPosition,
    } = this.state;

    return (
      <div className="map-container">
        <NProgress />
        <ClusterModal />
        <SimpleModal />
        <Input className="search-box" icon>
          <input id="searchBoxInput" placeholder="Search places" />
          <Icon name="search" />
        </Input>
        {currentPosition ? (
          <Button
            className="current-loc"
            icon="home"
            onClick={() => {
              this.props.updateMapState(currentPosition, 12);
            }}
            circular
          />
        ) : null}

        <GoogleMapReact
          defaultZoom={DEFAULT_ZOOM}
          bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds', libraries: 'places' }}
          options={mapOption}
          // defaultCenter={mapState.center}
          center={mapState.center}
          zoom={mapState.zoom}
          hoverDistance={HOVER_DISTANCE}
          margin={[MARGIN_TOP, MARGIN_RIGHT, MARGIN_BOTTOM, MARGIN_LEFT]}
          onChange={this._onChange}
          onChildClick={this._onChildClick}
          onGoogleApiLoaded={({ maps }) => {
            const input = document.getElementById('searchBoxInput');
            const searchBox = new maps.places.SearchBox(input);

            searchBox.addListener('places_changed', () => {
              const places = searchBox.getPlaces();

              this.props.updateMapState({
                lat: places[0].geometry.location.lat(),
                lng: places[0].geometry.location.lng(),
              }, 12);
            });
          }}
          yesIWantToUseGoogleMapApiInternals
        >
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
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

