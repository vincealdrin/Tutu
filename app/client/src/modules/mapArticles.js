import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import {
  crudStatus,
  updateCrudStatus,
  httpThunk,
  buildArticleQueryParams,
} from '../utils';
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_CENTER,
} from '../constants';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';
export const FETCH_FOCUSED_INFO = 'mapArticles/FETCH_FOCUSED_INFO';
export const FETCH_CLUSTER_INFO = 'mapArticles/FETCH_CLUSTER_INFO';
export const REMOVE_FOCUSED = 'mapArticles/REMOVE_FOCUSED';
export const UPDATE_MAP_STATE = 'mapArticles/UPDATE_MAP_STATE';
export const TOGGLE_SOURCES = 'mapArticles/TOGGLE_SOURCES';
export const CLEAR_STATE = 'mapArticles/CLEAR_STATE';
export const INIT_LOAD = 'mapArticles/INIT_LOAD';

const initialState = {
  articles: [],
  clusters: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  infoStatus: crudStatus,
  clusterStatus: crudStatus,
  focusedInfo: {},
  focusedClusterInfo: [],
  focusedClusterArticles: [],
  focusedOn: '',
  mapState: {
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,
    bounds: {},
  },
  isCredible: true,
  initLoad: true,
};
let source;
let focusedClusterSource;
let focusedInfoSource;

const articlesReducer = (state, action) => {
  if (action.isMap || action.isNewQuery) {
    return action.articles || state.articles;
  }

  return action.articles
    ? [...state.articles, ...action.articles]
    : state.articles;
};

const clusterReducer = (state, action) => {
  const { center, zoom, bounds } = action;
  const articles = action.articles || state.articles;

  const coords = flattenDeep(articles.map(({
    locations,
  }, index) =>
    locations.map(({
      lng,
      lat,
    }) => ({
      id: index,
      lng,
      lat,
    }))));

  const cluster = supercluster(coords, {
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    radius: 52,
  });

  return cluster({
    center,
    zoom,
    bounds,
  });
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CLEAR_STATE:
      return initialState;
    case TOGGLE_SOURCES:
      return {
        ...state,
        clusters: [],
        articles: [],
        isCredible: !state.isCredible,
      };
    case FETCH_ARTICLES:
      return {
        ...state,
        articles: articlesReducer(state, action),
        clusters: action.articles && (action.isMap === undefined || action.isMap)
          ? clusterReducer(state, action)
          : state.clusters,
        totalCount: action.totalCount || state.totalCount,
        fetchStatus: updateCrudStatus(action),
        initLoad: false,
      };
    case UPDATE_MAP_STATE:
      return {
        ...state,
        clusters: clusterReducer(state, action),
        mapState: {
          center: action.center,
          zoom: action.zoom,
          bounds: action.bounds,
        },
      };
    case INIT_LOAD:
      return {
        ...state,
        initLoad: true,
      };
    case FETCH_FOCUSED_INFO:
      return {
        ...state,
        focusedInfo: action.focusedInfo
          ? action.focusedInfo
          : state.focusedInfo,
        focusedOn: 'simple',
        infoStatus: updateCrudStatus(action),
        focusedClusterInfo: [],
      };
    case FETCH_CLUSTER_INFO:
      return {
        ...state,
        focusedClusterInfo: action.focusedClusterInfo
          ? action.focusedClusterInfo
          : state.focusedClusterInfo,
        focusedOn: 'cluster',
        clusterStatus: updateCrudStatus(action),
        focusedClusterArticles: action.focusedClusterArticles || state.focusedClusterArticles,
        focusedInfo: {},
      };
    case REMOVE_FOCUSED:
      return {
        ...state,
        focusedOn: '',
        focusedInfo: {},
        focusedClusterInfo: [],
        focusedClusterArticles: [],
        infoStatus: crudStatus,
        clusterStatus: crudStatus,
        reactionStatus: crudStatus,
      };
    default:
      return state;
  }
};

export const removeFocused = () => {
  if (focusedClusterSource) {
    focusedClusterSource.cancel();
  }

  if (focusedInfoSource) {
    focusedInfoSource.cancel();
  }

  return {
    type: REMOVE_FOCUSED,
  };
};

export const updateMapState = (center, zoom, bounds) => ({
  type: UPDATE_MAP_STATE,
  center,
  zoom,
  bounds,
});

export const fetchArticles = (limit, page, cb, isNewQuery = false) =>
  httpThunk(FETCH_ARTICLES, async (getState) => {
    if (source) {
      source.cancel();
      // dispatch(endTask());
    }
    source = axios.CancelToken.source();
    try {
      const {
        mapArticles: {
          mapState: {
            zoom,
            bounds,
            center,
          },
          isCredible,
        },
        router: { location },
        filters,
      } = getState();
      const isMap = !/grid/.test(location.pathname);
      const params = buildArticleQueryParams({
        filters,
        isCredible,
        limit,
        page,
        isMap,
      });

      const {
        data: articles,
        headers,
        status,
      } = await axios.get('/articles', {
        cancelToken: source.token,
        params,
      });

      if (cb) cb();

      // dispatch(updateMapState(center, zoom, bounds));
      source = null;

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        articles,
        status,
        isMap,
        isNewQuery,
        center,
        bounds,
        zoom,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchFocusedInfo = (article) =>
  httpThunk(FETCH_FOCUSED_INFO, async (getState) => {
    try {
      if (focusedInfoSource) {
        focusedInfoSource.cancel();
        // dispatch(endTask());
      }
      focusedInfoSource = axios.CancelToken.source();

      const {
        filters: {
          categories,
        },
        mapArticles: {
          isCredible,
        },
      } = getState();
      const {
        data: focusedInfo,
        status,
      } = await axios.get('/articles/info', {
        params: {
          id: article.id,
          isCredible: isCredible ? 'yes' : 'no',
          catsFilterLength: categories.length,
        },
        cancelToken: focusedInfoSource.token,
      });

      focusedInfoSource = null;

      return {
        focusedInfo: {
          ...article,
          ...focusedInfo,
        },
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchFocusedClusterInfo = (articles, page = 0, limit = 10) =>
  httpThunk(FETCH_CLUSTER_INFO, async (getState) => {
    try {
      if (focusedClusterSource) {
        focusedClusterSource.cancel();
        // dispatch(endTask());
      }
      focusedClusterSource = axios.CancelToken.source();

      const {
        filters: {
          categories,
        },
        mapArticles: {
          focusedClusterArticles,
          isCredible,
        },
      } = getState();
      const sliceArticles = (focusedClusterArticles.length ? focusedClusterArticles : articles)
        .slice(page * limit, (page + 1) * limit);

      const {
        data: focusedClusterInfo,
        status,
      } = await axios.get('/articles/clusterInfo', {
        params: {
          catsFilterLength: categories.length,
          isCredible: isCredible ? 'yes' : 'no',
          ids: sliceArticles.map((article) => article.id).join(),
        },
        cancelToken: focusedClusterSource.token,
      });

      const payload = {
        focusedClusterInfo: await sliceArticles.map((article) => ({
          ...article,
          ...focusedClusterInfo.find((info) => info.id === article.id),
        })),
        status,
      };

      if (!focusedClusterArticles.length) {
        payload.focusedClusterArticles = articles;
      }

      focusedClusterSource = null;

      return payload;
    } catch (e) {
      return e;
    }
  });

export const toggleSourcesType = () => ({ type: TOGGLE_SOURCES });
export const clearState = () => ({ type: CLEAR_STATE });
export const initLoad = () => ({ type: INIT_LOAD });
