import axios from 'axios';
import { crudStatus, updateCrudStatus } from '../utils';

export const FETCH_RECENT_ARTICLES = 'recentArticles/FETCH_RECENT_ARTICLES';
export const ADD_RECENT_ARTICLE = 'recentArticles/ADD_RECENT_ARTICLE';

const initialState = {
  articles: [],
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
    case ADD_RECENT_ARTICLE:
      return {
        ...state,
        articles: [
          action.newArticle,
          ...state.articles,
        ],
      };
    default:
      return state;
  }
};

export const fetchRecentArticles = (limit, cb) => async (dispatch) => {
  dispatch({ type: FETCH_RECENT_ARTICLES, statusText: 'pending' });

  try {
    const { data: articles, headers, status } = await axios.get('/articles/recent', {
      params: {
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

    if (cb) cb();
  } catch (e) {
    dispatch({
      type: FETCH_RECENT_ARTICLES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
    });
  }
};


export const addRecentArticle = (newArticle) => (dispatch) => {
  dispatch({
    type: ADD_RECENT_ARTICLE,
    newArticle,
  });
};
