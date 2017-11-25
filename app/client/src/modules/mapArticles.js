import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import { crudStatus, updateCrudStatus } from '../util';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';

const initialState = {
  articles: [],
  clusters: [],
  totalCount: 0,
  isFetching: false,
  fetchStatus: crudStatus,
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
    default:
      return state;
  }
};

export const fetchArticles = (center, zoom, bounds, maxDist, limit) => async (dispatch) => {
  dispatch({ type: FETCH_ARTICLES, statusText: 'pending' });

  try {
    const {
      ne, nw, se, sw,
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
        maxDist,
        limit,
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
      maxZoom: 16,
      radius: 60,
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
