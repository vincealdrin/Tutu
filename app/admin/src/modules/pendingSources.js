import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_PENDING_SOURCES = 'pendingSources/FETCH_PENDING_SOURCES';
export const CREATE_PENDING_SOURCE = 'pendingSources/CREATE_PENDING_SOURCE';
export const UPDATE_PENDING_SOURCE = 'pendingSources/UPDATE_PENDING_SOURCE';
export const DELETE_PENDING_SOURCES = 'pendingSources/DELETE_PENDING_SOURCE';

const initialState = {
  sources: [],
  fetchStatus: crudStatus,
  createStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_PENDING_SOURCES:
      return {
        ...state,
        sources: action.sources || state.sources,
        fetchStatus: updateCrudStatus(action),
      };
    case CREATE_PENDING_SOURCE:
      return {
        ...state,
        sources: [
          ...action.sources,
          action.newSource,
        ],
        createStatus: updateCrudStatus(action),
      };
    case UPDATE_PENDING_SOURCE:
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
    case DELETE_PENDING_SOURCES:
      return {
        ...state,
        sources: state.sources.filter((source) => action.deletedIds.includes(source.id)),
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchSources = () => async (dispatch) => {
  dispatch({ type: FETCH_PENDING_SOURCES, statusText: 'pending' });

  try {
    const sources = await axios.get('a');

    dispatch({
      type: FETCH_PENDING_SOURCES,
      statusText: 'success',
      sources,
    });
  } catch (e) {
    dispatch({
      type: FETCH_PENDING_SOURCES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const createSource = (source) => async (dispatch) => {
  dispatch({ type: CREATE_PENDING_SOURCE, statusText: 'pending' });

  try {
    const id = await axios.post('a', source);

    dispatch({
      type: CREATE_PENDING_SOURCE,
      statusText: 'success',
      newSource: { ...source, id },
    });
  } catch (e) {
    dispatch({
      type: CREATE_PENDING_SOURCE,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const updateSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_PENDING_SOURCE, statusText: 'pending' });

  try {
    const endpoint = `/sources/${sourceId}`;
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

export const deleteSources = (ids) => async (dispatch) => {
  dispatch({ type: DELETE_PENDING_SOURCES, statusText: 'pending' });

  try {
    await axios.put('/sources/', ids);

    dispatch({
      type: DELETE_PENDING_SOURCES,
      statusText: 'success',
      deletedIds: ids,
    });
  } catch (e) {
    dispatch({
      type: DELETE_PENDING_SOURCES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};
