import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_PENDING_SOURCES = 'pendingSources/FETCH_PENDING_SOURCES';
export const ADD_PENDING_SOURCES = 'pendingSources/ADD_PENDING_SOURCES';
export const UPDATE_PENDING_SOURCE = 'pendingSources/UPDATE_PENDING_SOURCE';
export const DELETE_PENDING_SOURCES = 'pendingSources/DELETE_PENDING_SOURCES';
export const VERIFY_PENDING_SOURCE = 'pendingSources/VERIFY_PENDING_SOURCE';

const initialState = {
  pendingSources: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  addStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
  verifyStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.pendingSources || state.pendingSources,
        fetchStatus: updateCrudStatus(action),
        totalCount: action.totalCount || state.totalCount,
      };
    case ADD_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.statusText === 'success' ? [
          action.newPendingSource,
          ...state.pendingSources,
        ] : state.pendingSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount + 1
          : state.totalCount,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_PENDING_SOURCE:
      return {
        ...state,
        pendingSources: state.pendingSources.map((source) => {
          if (source.id === action.sourceId) {
            return action.updateSource;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_PENDING_SOURCES:
      return {
        ...state,
        pendingSources: action.statusText === 'success'
          ? state.pendingSources.filter((source) => !action.deletedIds.includes(source.id))
          : state.pendingSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    case VERIFY_PENDING_SOURCE:
      return {
        ...state,
        pendingSources: action.statusText === 'success'
          ? state.pendingSources.filter((source) => action.id !== source.id)
          : state.pendingSources,
        verifyStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchPendingSources = (page, limit, filter, search) =>
  httpThunk(FETCH_PENDING_SOURCES, async () => {
    try {
      const { data: pendingSources, status, headers } = await axios.get('/pendingSources', {
        params: {
          page,
          limit,
          filter,
          search,
        },
      });

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        pendingSources,
        status,
      };
    } catch (e) {
      return e;
    }
  });


export const addPendingSources = () => httpThunk(ADD_PENDING_SOURCES, async (getState) => {
  const { form } = getState();

  try {
    const { data: newPendingSource, status } = await axios.post('/pendingSources', {
      ...form.pendingSources.values,
    });

    return {
      newPendingSource,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updatePendingSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_PENDING_SOURCE, statusText: 'pending' });

  try {
    const endpoint = `/pendingSources/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_PENDING_SOURCE,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_PENDING_SOURCE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const deletePendingSources = (ids) => httpThunk(DELETE_PENDING_SOURCES, async () => {
  try {
    const { status } = await axios.delete('/pendingSources', {
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

export const verifyPendingSource = (id, isReliable) =>
  httpThunk(VERIFY_PENDING_SOURCE, async (getState) => {
    try {
      const { user: { info } } = getState();
      const { status } = await axios.post('/pendingSources/verify', {
        userId: info.id,
        id,
        isReliable,
      });

      return {
        id,
        status,
        isReliable,
      };
    } catch (e) {
      return e;
    }
  });
