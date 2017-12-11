import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_ARTICLES = 'articles/FETCH_ARTICLES';
export const CREATE_ARTICLE = 'articles/CREATE_ARTICLE';
export const UPDATE_ARTICLE = 'articles/UPDATE_ARTICLE';
export const DELETE_ARTICLES = 'articles/DELETE_ARTICLE';
export const DECREMENT = 'articles/DECREMENT';

const initialState = {
  articles: [],
  fetchStatus: crudStatus,
  createStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ARTICLES:
      return {
        ...state,
        articles: action.articles || state.articles,
        fetchStatus: updateCrudStatus(action),
      };
    case CREATE_ARTICLE:
      return {
        ...state,
        articles: [
          ...action.articles,
          action.newArticle,
        ],
        createStatus: updateCrudStatus(action),
      };
    case UPDATE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((article) => {
          if (article.id === action.articleId) {
            return action.updateArticle;
          }
          return article;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_ARTICLES:
      return {
        ...state,
        articles: state.articles.filter((article) => action.deletedIds.includes(article.id)),
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchArticles = () => async (dispatch) => {
  dispatch({ type: FETCH_ARTICLES, statusText: 'pending' });

  try {
    const articles = await axios.get('a');

    dispatch({
      type: FETCH_ARTICLES,
      statusText: 'success',
      articles,
    });
  } catch (e) {
    dispatch({
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
      type: FETCH_ARTICLES,
    });
  }
};

export const createArticle = (article) => async (dispatch) => {
  dispatch({ type: CREATE_ARTICLE, statusText: 'pending' });

  try {
    const id = await axios.post('a', article);

    dispatch({
      type: CREATE_ARTICLE,
      statusText: 'success',
      newArticle: { ...article, id },
    });
  } catch (e) {
    dispatch({
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
      type: CREATE_ARTICLE,
    });
  }
};

export const updateArticle = (articleId, article, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_ARTICLE, statusText: 'pending' });

  try {
    const endpoint = `/articles/${articleId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedArticle = await axios.put(path, article);

    dispatch({
      type: UPDATE_ARTICLE,
      statusText: 'success',
      updatedArticle,
    });
  } catch (e) {
    dispatch({
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
      type: UPDATE_ARTICLE,
    });
  }
};

export const deleteArticles = (ids) => async (dispatch) => {
  dispatch({ type: DELETE_ARTICLES, statusText: 'pending' });

  try {
    await axios.put('/articles/', ids);

    dispatch({
      type: DELETE_ARTICLES,
      statusText: 'success',
      deletedIds: ids,
    });
  } catch (e) {
    dispatch({
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
      type: DELETE_ARTICLES,
    });
  }
};
