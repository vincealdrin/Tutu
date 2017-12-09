import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import { crudStatus, updateCrudStatus } from '../utils';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';
export const FETCH_FOCUSED_INFO = 'mapArticles/FETCH_FOCUSED_INFO';
export const FETCH_CLUSTER_INFO = 'mapArticles/FETCH_CLUSTER_INFO';
export const REMOVE_FOCUSED = 'mapArticles/REMOVE_FOCUSED';
export const UPDATE_REACTION = 'mapArticles/UPDATE_REACTION';
export const UPDATE_MAP_STATE = 'mapArticles/UPDATE_MAP_STATE';

const initialState = {
  articles: [],
  clusters: [],
  totalCount: 0,
  fetchArtsStatus: crudStatus,
  fetchFocusedInfoStatus: crudStatus,
  fetchFocusedClusterInfoStatus: crudStatus,
  updateReactionStatus: crudStatus,
  focusedInfo: {},
  focusedClusterInfo: [],
  focusedOn: '',
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
        fetchArtStatus: updateCrudStatus(action),
      };
    case UPDATE_MAP_STATE:
      return {
        ...state,
        mapState: action.mapState,
      };
    case FETCH_FOCUSED_INFO:
      return {
        ...state,
        focusedInfo: action.focusedInfo || state.focusedInfo,
        focusedOn: 'simple',
        fetchFocusedInfoStatus: updateCrudStatus(action),
        focusedClusterInfo: [],
      };
    case FETCH_CLUSTER_INFO:
      return {
        ...state,
        focusedClusterInfo: action.focusedClusterInfo || state.focusedClusterInfo,
        focusedOn: 'cluster',
        fetchFocusedClusterInfoStatus: updateCrudStatus(action),
        focusedInfo: {},
        isFocused: true,
      };
    case REMOVE_FOCUSED:
      return {
        ...state,
        focusedOn: '',
        focusedInfo: {},
        focusedClusterInfo: [],
      };
    case UPDATE_REACTION:
      return {
        ...state,
        articles: state.articles.map((article) => {
          if (article.url === action.url) {
            return {
              ...article,
              reactions: {},
            };
          }
          return article;
        }),
        updateReactionStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchArticles = () => async (dispatch, getState) => {
  dispatch({ type: FETCH_ARTICLES, statusText: 'pending' });

  try {
    const { filters, mapArticles: { mapState } } = getState();
    const {
      center,
      zoom,
      bounds,
    } = mapState;
    const {
      ne, nw,
      se, sw,
    } = bounds;
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
        people: filters.people.join(),
        orgs: filters.organizations.join(),
        sentiment: filters.sentiment !== 'none' ? filters.sentiment : '',
        popular: filters.popular.socials.length ? `${filters.popular.socials.join()}|${filters.popular.top}` : '',
        timeWindow: `${31 - filters.timeWindow[0]},${31 - filters.timeWindow[1]}`,
        limit: filters.limit,
      },
    });


    const coords = flattenDeep(articles.map(({ locations }, index) =>
      locations.map(({ lng, lat }) => ({
        id: index,
        lng,
        lat,
      }))));
    const cluster = supercluster(coords, {
      minZoom: 6,
      maxZoom: 16,
      radius: 30,
    });
    const clusters = cluster({ center, zoom, bounds });

    dispatch({
      type: FETCH_ARTICLES,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      clusters,
      articles,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_ARTICLES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
    });
  }
};

export const fetchFocusedInfo = (article) => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_FOCUSED_INFO, statusText: 'pending' });
    const { filters: { categories } } = getState();
    const { data: focusedInfo, status } = await axios.get('/articles/info', {
      params: {
        url: article.url,
        catsFilter: categories.length,
      },
    });

    dispatch({
      type: FETCH_FOCUSED_INFO,
      statusText: 'success',
      focusedInfo: {
        ...focusedInfo,
        ...article,
      },
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_FOCUSED_INFO,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
    });
  }
};

export const fetchFocusedClusterInfo = (articles) => async (dispatch, getState) => {
  try {
    dispatch({ type: FETCH_CLUSTER_INFO, statusText: 'pending' });
    const { filters: { categories } } = getState();
    const { data: focusedClusterInfo, status } = await axios.get('/articles/clusterInfo', {
      params: {
        urls: articles.map((article) => article.url).join(),
        catsFilter: categories.length,
      },
    });

    dispatch({
      type: FETCH_CLUSTER_INFO,
      statusText: 'success',
      focusedClusterInfo: articles.map((article, i) => ({
        ...article,
        ...focusedClusterInfo[i],
      })),
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_CLUSTER_INFO,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
    });
  }
};

export const updateReaction = (url, reaction) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_REACTION, statusText: 'pending' });
    const { status } = await axios.put('/articles/reactions', {
      data: {
        url,
        reaction,
      },
    });

    dispatch({
      type: UPDATE_REACTION,
      statusText: 'success',
      url,
      reaction,
      status,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_REACTION,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
    });
  }
};

export const removeFocused = () => ({
  type: REMOVE_FOCUSED,
});

export const updateMapState = (center, zoom, bounds) => ({
  type: UPDATE_MAP_STATE,
  mapState: {
    center,
    zoom,
    bounds,
  },
});
