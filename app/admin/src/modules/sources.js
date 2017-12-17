import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_SOURCES = 'sources/FETCH_SOURCES';
export const ADD_SOURCES = 'sources/ADD_SOURCES';
export const UPDATE_SOURCE = 'sources/UPDATE_SOURCE';
export const DELETE_SOURCES = 'sources/DELETE_SOURCE';

const initialState = {
  sources: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  addStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SOURCES:
      return {
        ...state,
        sources: action.sources || state.sources,
        fetchStatus: updateCrudStatus(action),
        totalCount: action.totalCount || state.totalCount,
      };
    case ADD_SOURCES:
      return {
        ...state,
        sources: action.newSources ? [
          ...action.newSources,
          ...state.sources,
        ] : state.sources,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_SOURCE:
      return {
        ...state,
        sources: state.sources.map((source) => {
          if (source.id === action.sourceId) {
            return action.updateSource;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_SOURCES:
      return {
        ...state,
        sources: action.deletedIds
          ? state.sources.filter((source) => !action.deletedIds.includes(source.id))
          : state.sources,
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchSources = (page = 0, limit = 15, filterKey = '', searchText = '') => httpThunk(FETCH_SOURCES, async () => {
  try {
    const { data: sources, status, headers } = await axios.get('/sources', {
      params: {
        page,
        limit,
        filterKey,
        searchText,
      },
    });

    return {
      totalCount: parseInt(headers['x-total-count'], 10),
      sources,
      status,
    };
  } catch (e) {
    return e;
  }
});


export const addSources = () => httpThunk(ADD_SOURCES, async (getState) => {
  try {
    const { form: { sources } } = getState();
    const urls = Object.values(sources.values);
    const { data: newSources, status } = await axios.post('/sources', urls);

    return {
      newSources,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updateSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_SOURCE, statusText: 'pending' });

  try {
    const endpoint = `/sources/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_SOURCE,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_SOURCE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
    });
  }
};

export const deleteSources = (ids) => httpThunk(DELETE_SOURCES, async () => {
  try {
    await axios.delete('/sources', {
      data: {
        ids: ids.join(),
      },
    });

    return {
      type: DELETE_SOURCES,
      statusText: 'success',
      deletedIds: ids,
    };
  } catch (e) {
    return e;
  }
});
