import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
  fetchArticles,
  fetchFocusedInfo,
  updateMapState,
  updateMapLocState,
  fetchFocusedClusterInfo,
  changeSourcesCredible,
  changeSourcesNotCredible,
  clearState,
} from '../../modules/mapArticles';
import { openModal } from '../../modules/insights';
import { fetchRecentArticles } from '../../modules/recentArticles';
import { fetchPopularArticles } from '../../modules/popularArticles';
import MapInterface from '../Common/MapInterface';
import Map from './Map';
import './styles.css';
import '../../index.css';
import {
  MAX_ZOOM,
  DEFAULT_CENTER,
  MIN_ZOOM,
  MOBILE_MIN_ZOOM,
  IS_MOBILE,
} from '../../constants';

const mapStateToProps = ({
  mapArticles: {
    articles,
    clusters,
    mapLocState,
    isCredible,
    focusedOn,
    fetchStatus,
    initLoad,
  },
}) => ({
  // mapState: map.viewport.toJS(),
  mapLocState,
  articles,
  clusters,
  isCredible,
  focusedOn,
  fetchStatus,
  initLoad,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchArticles,
  fetchFocusedInfo,
  updateMapState,
  fetchFocusedClusterInfo,
  changeSourcesCredible,
  changeSourcesNotCredible,
  fetchRecentArticles,
  fetchPopularArticles,
  updateMapLocState,
  openModal,
  clearState,
}, dispatch);

let timeoutId;

class MapView extends Component {
  _onChange = ({
    center,
    zoom,
    bounds,
  }) => {
    // console.log(bounds);
    // console.log(zoom);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    const { initLoad } = this.props;
    const {
      ne: { lng: rightBound, lat: topBound },
      se: { lat: botBound },
      nw: { lng: leftBound },
    } = bounds;

    // console.log(bounds);
    switch (zoom) {
      case MIN_ZOOM:
        if (IS_MOBILE) {
          if (rightBound > 128.3889050292969) {
            timeoutId = setTimeout(() => {
              this.props.updateMapLocState({
                lat: center.lat,
                lng: 123.8314099121094,
              }, MIN_ZOOM);
            }, 100);
          }

          if (leftBound < 114.8061901855469) {
            timeoutId = setTimeout(() => {
              this.props.updateMapLocState({
                lat: center.lat,
                lng: 119.6213269042969,
              }, MIN_ZOOM);
            }, 100);
          }

          if (topBound > 22.457847641861107) {
            timeoutId = setTimeout(() => {
              this.props.updateMapLocState({
                lat: 16.331994375473,
                lng: center.lng,
              }, MIN_ZOOM);
            }, 100);
          }

          if (botBound < 3.287710510264418) {
            timeoutId = setTimeout(() => {
              this.props.updateMapLocState({
                lat: 10.096137280287343,
                lng: center.lng,
              }, MIN_ZOOM);
            }, 100);
          }
        } else if (center.lng > DEFAULT_CENTER.lng || center.lng < DEFAULT_CENTER.lng) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState(DEFAULT_CENTER, MIN_ZOOM);
          }, 100);
        }
        break;
      case 7:
        if (rightBound > 129.8176159667969) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 122.1314099121094,
            }, 7);
          }, 100);
        }

        if (leftBound < 112.91314819335935) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 121.6213269042969,
            }, 7);
          }, 100);
        }

        if (topBound > 21.490580700830535) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 17.131994375473,
              lng: center.lng,
            }, 7);
          }, 100);
        }

        if (botBound < 3.183849540341299) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 8.596137280287343,
              lng: center.lng,
            }, 7);
          }, 100);
        }
        break;
      case 8:
        if (rightBound > 132.90153930664064) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 125.8314099121094,
            }, 8);
          }, 100);
        }

        if (leftBound < 112.8045544433594) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 118.6213269042969,
            }, 8);
          }, 100);
        }

        if (topBound > 21.870177650159505) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 19.631994375473,
              lng: center.lng,
            }, 8);
          }, 100);
        }

        if (botBound < 4.501446551859408) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 6.596137280287343,
              lng: center.lng,
            }, 8);
          }, 100);
        }
        break;
      case 9:
        if (rightBound > 129.51363037109377) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 125.8314099121094,
            }, 9);
          }, 100);
        }

        if (leftBound < 113.6724743652344) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 117.6213269042969,
            }, 9);
          }, 100);
        }

        if (topBound > 21.690238515991084) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 20.631994375473,
              lng: center.lng,
            }, 9);
          }, 100);
        }

        if (botBound < 4.240199986969856) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 5.296137280287343,
              lng: center.lng,
            }, 9);
          }, 100);
        }
        break;
      case 10:
        if (rightBound > 128.0424923706055) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 125.8314099121094,
            }, 10);
          }, 100);
        }

        if (leftBound < 115.53255126953127) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 116.9213269042969,
            }, 10);
          }, 100);
        }

        if (topBound > 21.466342099774664) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 20.831994375473,
              lng: center.lng,
            }, 10);
          }, 100);
        }

        if (botBound < 4.67430457682338) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 5.096137280287343,
              lng: center.lng,
            }, 10);
          }, 100);
        }
        break;
      case 11:
        if (rightBound > 127.37987945556642) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 125.8314099121094,
            }, 11);
          }, 100);
        }

        if (leftBound < 116.46453521728517) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 116.9213269042969,
            }, 11);
          }, 100);
        }

        if (topBound > 21.34451936116666) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 21.05994375473,
              lng: center.lng,
            }, 11);
          }, 100);
        }

        if (botBound < 4.52899228122202) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 4.796137280287343,
              lng: center.lng,
            }, 11);
          }, 100);
        }
        break;
      case MAX_ZOOM:
        if (rightBound > 126.86695526123049) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 125.8314099121094,
            }, MAX_ZOOM);
          }, 100);
        }

        if (leftBound < 116.648571472167997) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: center.lat,
              lng: 116.9213269042969,
            }, MAX_ZOOM);
          }, 100);
        }

        if (topBound > 21.280528599739483) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 21.15994375473,
              lng: center.lng,
            }, MAX_ZOOM);
          }, 100);
        }

        if (botBound < 4.466922503276468) {
          timeoutId = setTimeout(() => {
            this.props.updateMapLocState({
              lat: 4.66922503276468,
              lng: center.lng,
            }, MAX_ZOOM);
          }, 100);
        }
        break;
      default:
        // if (rightBound > 126.86695526123049) {
        //   timeoutId = setTimeout(() => {
        //     this.props.updateMapLocState({
        //       lat: center.lat,
        //       lng: 125.8314099121094,
        //     }, MOBILE_DEFAULT_ZOOM);
        //   }, 100);
        // }

        // if (leftBound < 116.648571472167997) {
        //   timeoutId = setTimeout(() => {
        //     this.props.updateMapLocState({
        //       lat: center.lat,
        //       lng: 116.9213269042969,
        //     }, MOBILE_DEFAULT_ZOOM);
        //   }, 100);
        // }

        // if (topBound > 21.280528599739483) {
        //   timeoutId = setTimeout(() => {
        //     this.props.updateMapLocState({
        //       lat: 21.15994375473,
        //       lng: center.lng,
        //     }, MOBILE_DEFAULT_ZOOM);
        //   }, 100);
        // }

        // if (botBound < 5.26922503276468) {
        //   timeoutId = setTimeout(() => {
        //     this.props.updateMapLocState({
        //       lat: 5.36922503276468,
        //       lng: center.lng,
        //     }, MOBILE_DEFAULT_ZOOM);
        //   }, 100);
        // }
        // if (center.lng > DEFAULT_CENTER.lng || center.lng < DEFAULT_CENTER.lng) {
        //   timeoutId = setTimeout(() => {
        //     this.props.updateMapLocState(DEFAULT_CENTER, MOBILE_MIN_ZOOM);
        //   }, 100);
        // }
    }

    this.props.updateMapState(center, zoom, bounds);

    if (initLoad) {
      this.props.fetchArticles();
    }
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
      isCredible,
      focusedOn,
      history: { location, push },
      fetchStatus,
      mapLocState,
    } = this.props;
    const isMap = !/grid/.test(location.pathname);

    return (
      <div className="map-container">
        <MapInterface
          isMap={isMap}
          isCredible={isCredible}
          status={fetchStatus}
          updateMapLocState={this.props.updateMapLocState}
          fetchArticles={this.props.fetchArticles}
          openInsights={this.props.openModal}
          onSourcesTypeChange={(isSidebarVisible, sourcesType) => {
            if (sourcesType === 'credible') {
              this.props.changeSourcesCredible();
            } else {
              this.props.changeSourcesNotCredible();
            }

            this.props.fetchArticles();

            if (isSidebarVisible) {
              this.props.fetchRecentArticles();
              this.props.fetchPopularArticles();
            }
          }}
          onViewToggle={() => {
            this.props.clearState();
            push('/grid/');
          }}
        />
        <Map
          mapLocState={mapLocState}
          clusters={clusters}
          articles={articles}
          openInsights={this.props.openModal}
          updateMapLocState={this.props.updateMapLocState}
          onChange={this._onChange}
          onChildClick={this._onChildClick}
          isCredible={isCredible}
          isFocused={focusedOn}
        />
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapView);

