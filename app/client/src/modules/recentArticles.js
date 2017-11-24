import axios from 'axios';
import { crudStatus, updateCrudStatus } from '../util';

export const FETCH_RECENT_ARTICLES = 'recentArticles/FETCH_RECENT_ARTICLES';

const initialState = {
  articles: [],
  totalCount: 0,
  isFetching: false,
  fetchStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RECENT_ARTICLES:
      return {
        ...state,
        articles: action.articles || state.articles,
        fetchStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchArticles = (lng, lat, maxDist, limit) => async (dispatch) => {
  dispatch({ type: FETCH_RECENT_ARTICLES, statusText: 'pending' });

  try {
    const { data: articles, headers, status } = await axios.get('/articles', {
      params: {
        lng,
        lat,
        maxDist,
        limit,
      },
    });

    dispatch({
      type: FETCH_RECENT_ARTICLES,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      articles,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_RECENT_ARTICLES,
      statusText: 'error',
      status: e.response.status,
    });
  }
};
