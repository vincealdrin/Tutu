import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';
import { fetchArticles } from '../../modules/mapArticles';
import Marker from '../Marker';
import './styles.css';

const mapStyle = [
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      {
        invert_lightness: true,
      },
      {
        saturation: 20,
      },
      {
        lightness: 50,
      },
      {
        gamma: 0.4,
      },
      {
        hue: '#00ffee',
      },
    ],
  },
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [
      {
        visibility: 'on',
      },
    ],
  },
  {
    featureType: 'administrative',
    elementType: 'all',
    stylers: [
      {
        color: '#ffffff',
      },
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'administrative.land_parcel',
    elementType: 'geometry.stroke',
    stylers: [
      {
        visibility: 'simplified',
      },
    ],
  },
  {
    featureType: 'landscape',
    elementType: 'all',
    stylers: [
      {
        color: '#405769',
      },
    ],
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      {
        color: '#232f3a',
      },
    ],
  },
];

const mapStateToProps = ({
  mapArticles: {
    articles,
    fetchStatus,
  },
}) => ({
  articles,
  fetchStatus,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
}, dispatch);

class MapView extends Component {
  defaultCenter = {
    lat: 14.60,
    lng: 120.98,
  }

  render() {
    const { articles } = this.props;
    return (
      <div className="mapview-container">
        <GoogleMapReact
          defaultZoom={9}
          defaultCenter={this.defaultCenter}
          bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
          options={{
            minZoom: 8,
            maxZoom: 21,
            styles: mapStyle,
            gestureHandling: 'greedy',
          }}
          onChange={(data) => {
            this.props.fetchArticles(data.bounds, 15);
          }}
        >
          {articles.map((article) => article.locations.map(([lng, lat]) => (
            <Marker
              lng={lng}
              lat={lat}
              article={article}
            />
          )))}
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

