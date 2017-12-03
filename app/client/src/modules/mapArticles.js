import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import { crudStatus, updateCrudStatus } from '../utils';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';
export const UPDATE_MAP_STATE = 'mapArticles/UPDATE_MAP_STATE';

const initialState = {
  articles: [],
  clusters: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  mapState: {
    zoom: 8,
    center: {
      lat: 14.84438951326129,
      lng: 121.64467285156252,
    },
    bounds: {
      nw: { lat: 16.783969147595457, lng: 117.42592285156252 },
      se: { lat: 12.887251816780562, lng: 125.86342285156252 },
      sw: { lat: 12.887251816780562, lng: 117.42592285156252 },
      ne: { lat: 16.783969147595457, lng: 125.86342285156252 },
    },
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ARTICLES:
      return {
        ...state,
        articles: action.articles || state.articles,
        clusters: action.clusters || state.clusters,
        fetchStatus: updateCrudStatus(action),
      };
    case UPDATE_MAP_STATE:
      return {
        ...state,
        mapState: action.mapState,
      };
    default:
      return state;
  }
};

export const fetchArticles = (center, zoom, bounds) => async (dispatch, getState) => {
  dispatch({
    type: UPDATE_MAP_STATE,
    mapState: {
      center,
      zoom,
      bounds,
    },
  });
  dispatch({ type: FETCH_ARTICLES, statusText: 'pending' });

  try {
    const {
      ne, nw, se, sw,
    } = bounds;
    const { filters } = getState();
    const { data: articles, headers, status } = await axios.get('/articles', {
      params: {
        neLng: ne.lng,
        neLat: ne.lat,
        nwLng: nw.lng,
        nwLat: nw.lat,
        seLng: se.lng,
        seLat: se.lat,
        swLng: sw.lng,
        swLat: sw.lat,
        keywords: filters.keywords.join(),
        categories: filters.categories.join(),
        sources: filters.sources.join(),
        timeWindow: `${filters.timeWindow.start},${filters.timeWindow.end}`,
        limit: filters.limit,
      },
    });
    const coords = flattenDeep(articles.map(({ locations }, index) =>
      locations.map(([lng, lat]) => ({
        id: index,
        lng,
        lat,
      }))));
    const cluster = supercluster(coords, {
      minZoom: 0,
      maxZoom: 14,
      radius: 50,
    });

    dispatch({
      type: FETCH_ARTICLES,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      clusters: cluster({ center, zoom, bounds }),
      articles,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_ARTICLES,
      statusText: 'error',
      status: e.response.status,
    });
  }
};
