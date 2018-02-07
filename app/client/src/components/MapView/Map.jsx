import React, { PureComponent } from 'react';
import GoogleMapReact from 'google-map-react';
import SimpleMarker from './SimpleMarker';
import ClusterMarker from './ClusterMarker';
import credibleMapStyle from './credibleMapStyle.json';
import notCredibleMapStyle from './notCredibleMapStyle.json';
import {
  MARGIN_TOP,
  MARGIN_RIGHT,
  MARGIN_BOTTOM,
  MARGIN_LEFT,
  HOVER_DISTANCE,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  MAPS_POSITION_LEFT_BOTTOM,
  MAPS_POSITION_BOTTOM_LEFT,
  MAPS_CONTROL_STYLE,
} from '../../constants';

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const mapOptions = {
  zoomControlOptions: {
    position: MAPS_POSITION_LEFT_BOTTOM,
    style: MAPS_CONTROL_STYLE,
  },
  mapTypeControlOptions: {
    position: MAPS_POSITION_BOTTOM_LEFT,
    style: MAPS_CONTROL_STYLE,
  },
  fullscreenControlOptions: {
    position: MAPS_POSITION_LEFT_BOTTOM,
    style: MAPS_CONTROL_STYLE,
  },
  fullscreenControl: true,
  zoomControl: true,
  mapTypeControl: true,
  minZoomOverride: true,
  minZoom: isMobile ? 7 : MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  gestureHandling: 'greedy',
};

class Map extends PureComponent {
  render() {
    const {
      mapLocState,
      clusters,
      articles,
      onChange,
      onChildClick,
      updateMapLocState,
      isCredible,
      isFocused,
    } = this.props;

    return (
      <GoogleMapReact
        defaultZoom={DEFAULT_ZOOM}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds', libraries: 'places' }}
        options={{
          ...mapOptions,
          styles: isCredible ? credibleMapStyle : notCredibleMapStyle,
        }}
        // defaultCenter={mapState.center}
        center={mapLocState.center}
        zoom={mapLocState.zoom}
        hoverDistance={HOVER_DISTANCE}
        margin={[MARGIN_TOP, MARGIN_RIGHT, MARGIN_BOTTOM, MARGIN_LEFT]}
        onChange={onChange}
        onChildClick={onChildClick}
        onGoogleApiLoaded={({ maps }) => {
          const input = document.getElementById('searchBoxInput');
          const inputMobile = document.getElementById('searchBoxInputMobile');

          const searchBox = new maps.places.SearchBox(input);
          const searchBoxMobile = new maps.places.SearchBox(inputMobile);

          searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            updateMapLocState({
              lat: places[0].geometry.location.lat(),
              lng: places[0].geometry.location.lng(),
            }, 12);
          });

          searchBoxMobile.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            updateMapLocState({
              lat: places[0].geometry.location.lat(),
              lng: places[0].geometry.location.lng(),
            }, 12);
          });
        }}
        yesIWantToUseGoogleMapApiInternals
      >
        {clusters.map(({
          wx: lng,
          wy: lat,
          numPoints,
          points,
        }) => {
          const id = `${lng}-${lat}-${numPoints}-${points[0].id}`;

          if (numPoints === 1) {
            const article = articles[points[0].id];
            return (
              <SimpleMarker
                key={id}
                article={article}
                lng={lng}
                lat={lat}
                isCredible={isCredible}
                isFocused={isFocused}
                isMobile={isMobile}
              />
            );
          }

          const ids = points.map((point) => point.id);
          return (
            <ClusterMarker
              key={id}
              articles={articles.filter((_, i) => ids.includes(i))}
              lng={lng}
              lat={lat}
              isCredible={isCredible}
              isFocused={isFocused}
              isMobile={isMobile}
            />
          );
        })}
      </GoogleMapReact>
    );
  }
}

export default Map;
