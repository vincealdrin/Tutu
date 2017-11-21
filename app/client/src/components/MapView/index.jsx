import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
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
    console.log(this.props);
    return (
      <div className="mapview-container">
        <GoogleMapReact
          defaultZoom={9}
          defaultCenter={this.defaultCenter}
          bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
          options={{
            minZoom: 9,
            maxZoom: 21,
            styles: mapStyle,
            gestureHandling: 'greedy',
          }}
          onChange={({ center: { lng, lat }, zoom }) => {
            const maxDist = zoom >= 13
            ? (900 / zoom) / 8
            : 1200 / zoom;

            this.props.fetchArticles(lng, lat, maxDist, 15);
          }}
        >
          {articles.map((article) => {
            console.log(article);
            return (
              <Marker
                lat={14}
                lng={14}
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

