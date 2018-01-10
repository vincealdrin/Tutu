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
        sources: action.statusText === 'success' ? [
          ...action.newSources,
          ...state.sources,
        ] : state.sources,
        totalCount: action.statusText === 'success'
          ? state.totalCount + action.newSources.length
          : state.totalCount,
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
        sources: action.statusText === 'success'
          ? state.sources.filter((source) => !action.deletedIds.includes(source.id))
          : state.sources,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchSources = (page, limit, filter, search) => httpThunk(FETCH_SOURCES, async () => {
  try {
    const { data: sources, status, headers } = await axios.get('/sources', {
      params: {
        isReliable: true,
        page,
        limit,
        filter,
        search,
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
  const { form } = getState();
  const urls = Object.values(form.sources.values);

  try {
    const { data: newSources, status } = await axios.post('/sources', {
      isReliable: true,
      urls,
    });

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
      errorMessage: e.response.data.message,
    });
  }
};

export const deleteSources = (ids) => httpThunk(DELETE_SOURCES, async () => {
  try {
    const { status } = await axios.delete('/sources', {
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
