import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import { fetchArticles } from '../../modules/mapArticles';
import MainMenu from '../MainMenu';
import SimpleMarker from './SimpleMarker';
import ClusterMarker from './ClusterMarker';
import mapStyle from './mapStyle.json';
import './styles.css';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    fetchStatus,
  },
}) => ({
  articles,
  clusters,
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
    const { articles, clusters } = this.props;
    return (
      <GoogleMapReact
        defaultZoom={9}
        defaultCenter={this.defaultCenter}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={{
            minZoom: 7,
            maxZoom: 16,
            styles: mapStyle,
            gestureHandling: 'greedy',
          }}
        onChange={({ center, zoom, bounds }) => {
            console.log(zoom);
            this.props.fetchArticles(center, zoom, bounds, 15);
          }}
      >
        {clusters.map(({
              wx, wy, numPoints, points,
            }) => {
            if (numPoints === 1) {
              const article = articles[points[0].id];

              return article.locations.map(([lng, lat]) => (
                <SimpleMarker
                  key={shortid.generate()}
                  article={article}
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

