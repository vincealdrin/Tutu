import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import GoogleMapReact from 'google-map-react';
import shortid from 'shortid';
import { fetchArticles, fetchArticleInfo } from '../../modules/mapArticles';
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
    fetchArticleInfoStatus,
    articleInfo,
  },
}) => ({
  articles,
  clusters,
  fetchStatus,
  mapState,
  relatedArticles,
  fetchArticleInfoStatus,
  articleInfo,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchArticleInfo,
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
  state = {
    hoveredChildKey: -1,
  }

  defaultCenter = {
    lat: 14.84438951326129,
    lng: 121.64467285156252,
  }

  _onChange = ({
    center, zoom,
    bounds, marginBounds,
  }) => {
    this.props.fetchArticles(center, zoom, marginBounds);
  }

  _onChildClick = (_, childProps) => {
    if (!childProps.clusters) {
      const key = `${childProps.url}-${childProps.lng}-${childProps.lat}`;

      if (this.state.hoveredChildKey !== key && childProps.url) {
        this.setState({ hoveredChildKey: key }, () => {
          this.props.fetchArticleInfo(childProps);
        });
      }
    }
  }

  render() {
    const {
      articles,
      clusters,
      mapState,
      articleInfo,
      fetchArticleInfoStatus,
    } = this.props;

    return (
      <GoogleMapReact
        defaultZoom={7}
        defaultCenter={this.defaultCenter}
        bootstrapURLKeys={{ key: 'AIzaSyC0v47qIFf6pweh1FZM3aekCv-dCFEumds' }}
        options={mapOption}
        margin={[K_MARGIN_TOP, K_MARGIN_RIGHT, K_MARGIN_BOTTOM, K_MARGIN_LEFT]}
        hoverDistance={K_HOVER_DISTANCE}
        onChange={this._onChange}
        onChildClick={this._onChildClick}
      >
        {articleInfo ? (
          <FocusedSimpleMarker
            article={articleInfo}
            status={fetchArticleInfoStatus}
            lng={articleInfo.lng}
            lat={articleInfo.lat}
          />
        ) : null}

        {clusters.map(({
              wx, wy, numPoints, points,
            }) => {
            if (numPoints === 1) {
              const article = articles[points[0].id];
              return article.locations.map(({ lng, lat }) => {
                const isNotFocused = `${articleInfo.url}-${articleInfo.lng}-${articleInfo.lat}` !== `${article.url}-${lng}-${lat}`;

                if (isNotFocused) {
                  return (
                    <SimpleMarker
                      key={shortid.generate()}
                      status={fetchArticleInfoStatus}
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

