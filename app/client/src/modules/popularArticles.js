import axios from 'axios';
import { crudStatus, updateCrudStatus } from '../utils';

export const FETCH_POPULAR_ARTICLES = 'recentArticles/FETCH_POPULAR_ARTICLES';
export const ADD_POPULAR_ARTICLE = 'recentArticles/ADD_POPULAR_ARTICLE';

const initialState = {
  articles: [],
  fetchStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_POPULAR_ARTICLES:
      return {
        ...state,
        articles: action.articles || state.articles,
        fetchStatus: updateCrudStatus(action),
      };
    case ADD_POPULAR_ARTICLE:
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

export const fetchPopularArticles = (limit) => async (dispatch) => {
  dispatch({ type: FETCH_POPULAR_ARTICLES, statusText: 'pending' });

  try {
    const { data: articles, headers, status } = await axios.get('/articles/popular', {
      params: {
        limit,
      },
    });

    dispatch({
      type: FETCH_POPULAR_ARTICLES,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      articles,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_POPULAR_ARTICLES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
    });
  }
};


export const addRecentArticle = (newArticle) => (dispatch) => {
  dispatch({
    type: ADD_POPULAR_ARTICLE,
    newArticle,
  });
};
