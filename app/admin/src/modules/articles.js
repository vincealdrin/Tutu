import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_ARTICLES = 'articles/FETCH_ARTICLES';
export const UPDATE_ARTICLE = 'articles/UPDATE_ARTICLE';
export const DELETE_ARTICLES = 'articles/DELETE_SOURCE';

const initialState = {
  articles: [],
  totalCount: 0,
  fetchStatus: crudStatus,
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
        totalCount: action.totalCount || state.totalCount,
      };
    case UPDATE_ARTICLE:
      return {
        ...state,
        articles: state.articles.map((source) => {
          if (source.id === action.sourceId) {
            return action.updatedArticle;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_ARTICLES:
      return {
        ...state,
        articles: action.statusText === 'success'
          ? state.articles.filter((user) => !action.deletedIds.includes(user.id))
          : state.articles,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchArticles = (page, limit, filter, search) =>
  httpThunk(FETCH_ARTICLES, async () => {
    try {
      const { data: articles, status, headers } = await axios.get('/articles', {
        params: {
          page,
          limit,
          filter,
          search,
        },
      });

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        articles,
        status,
      };
    } catch (e) {
      return e;
    }
  });


export const updateArticle = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_ARTICLE, statusText: 'pending' });

  try {
    const endpoint = `/articles/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_ARTICLE,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_ARTICLE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const deleteArticles = (ids) => httpThunk(DELETE_ARTICLES, async () => {
  try {
    const { status } = await axios.delete('/articles', {
      data: {
        ids: ids.join(),
      },
    });

    return {
      deletedIds: ids,
      status,
    };
  } catch (e) {
    return e;
  }
});
