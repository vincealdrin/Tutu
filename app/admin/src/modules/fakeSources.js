import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_FAKE_SOURCES = 'fakeSources/FETCH_FAKE_SOURCES';
export const ADD_FAKE_SOURCES = 'fakeSources/ADD_FAKE_SOURCES';
export const UPDATE_FAKE_SOURCE = 'fakeSources/UPDATE_FAKE_SOURCE';
export const DELETE_FAKE_SOURCES = 'fakeSources/DELETE_SOURCE';

const initialState = {
  fakeSources: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  addStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_FAKE_SOURCES:
      return {
        ...state,
        fakeSources: action.fakeSources || state.fakeSources,
        fetchStatus: updateCrudStatus(action),
        totalCount: action.totalCount || state.totalCount,
      };
    case ADD_FAKE_SOURCES:
      return {
        ...state,
        fakeSources: action.statusText === 'success' ? [
          ...action.newFakeSources,
          ...state.fakeSources,
        ] : state.fakeSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount + action.newFakeSources.length
          : state.totalCount,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_FAKE_SOURCE:
      return {
        ...state,
        fakeSources: state.fakeSources.map((source) => {
          if (source.id === action.sourceId) {
            return action.updateSource;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_FAKE_SOURCES:
      return {
        ...state,
        fakeSources: action.statusText === 'success'
          ? state.fakeSources.filter((source) => !action.deletedIds.includes(source.id))
          : state.fakeSources,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchFakeSources = (page, limit, filter, search) =>
  httpThunk(FETCH_FAKE_SOURCES, async () => {
    try {
      const { data: fakeSources, status, headers } = await axios.get('/fakeSources', {
        params: {
          page,
          limit,
          filter,
          search,
        },
      });

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        fakeSources,
        status,
      };
    } catch (e) {
      return e;
    }
  });


export const addFakeSources = () => httpThunk(ADD_FAKE_SOURCES, async (getState) => {
  const { form } = getState();
  const urls = Object.values(form.fakeSources.values);

  try {
    const { data: newFakeSources, status } = await axios.post('/fakeSources', urls);

    return {
      newFakeSources,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updateFakeSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_FAKE_SOURCE, statusText: 'pending' });

  try {
    const endpoint = `/fakeSources/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_FAKE_SOURCE,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_FAKE_SOURCE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const deleteFakeSources = (ids) => httpThunk(DELETE_FAKE_SOURCES, async () => {
  try {
    const { status } = await axios.delete('/fakeSources', {
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
