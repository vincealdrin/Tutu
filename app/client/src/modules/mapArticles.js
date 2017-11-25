import axios from 'axios';
import { crudStatus, updateCrudStatus } from '../util';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';

const initialState = {
  articles: [],
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
        fetchStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchArticles = (bounds, maxDist, limit) => async (dispatch) => {
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
    console.log(articles);
    dispatch({
      type: FETCH_ARTICLES,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
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
