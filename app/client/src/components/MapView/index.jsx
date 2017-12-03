import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import { fetchArticles, fetchRelatedArticles } from '../../modules/mapArticles';
import SimpleMarker from './SimpleMarker';
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
  },
}) => ({
  articles,
  clusters,
  fetchStatus,
  mapState,
  relatedArticles,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchRelatedArticles,
}, dispatch);

const mapOption = {
  zoomControl: false,
  fullscreenControl: false,
  minZoom: 7,
  maxZoom: 12,
  styles: mapStyle,
  gestureHandling: 'greedy',
};

class MapView extends Component {
  defaultCenter = {
    lat: 14.84438951326129,
    lng: 121.64467285156252,
  }

  render() {
    const {
      articles,
      clusters,
      mapState,
    } = this.props;

    return (
      <GoogleMapReact
        defaultZoom={7}
        defaultCenter={this.defaultCenter}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={mapOption}
        onChange={({ center, zoom, bounds }) => {
          this.props.fetchArticles(center, zoom, bounds);
        }}
      >
        {clusters.map(({
              wx, wy, numPoints, points,
            }) => {
            if (numPoints === 1) {
              const article = articles[points[0].id];

              return article.locations.map(({ lng, lat }) => (
                <SimpleMarker
                  key={shortid.generate()}
                  article={article}
                  fetchRelatedArticles={this.props.fetchRelatedArticles}
                  lng={lng}
                  lat={lat}
                />
              ));
            }

            return (
              <ClusterMarker
                key={shortid.generate()}
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

