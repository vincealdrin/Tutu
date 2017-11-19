import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../../utils';

export const FETCH_SOURCES = 'sources/FETCH_SOURCES';
export const CREATE_SOURCE = 'sources/CREATE_SOURCE';
export const UPDATE_SOURCE = 'sources/UPDATE_SOURCE';
export const DELETE_SOURCES = 'sources/DELETE_SOURCE';
export const DECREMENT = 'sources/DECREMENT';

const initialState = {
  sources: [],
  fetchStatus: crudStatus,
  createStatus: crudStatus,
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
      };
    case CREATE_SOURCE:
      return {
        ...state,
        sources: [
          ...action.sources,
          action.newSource,
        ],
        createStatus: updateCrudStatus(action),
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
        sources: state.sources.filter((source) => action.deletedIds.includes(source.id)),
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchSources = () => async (dispatch) => {
  dispatch({ type: FETCH_SOURCES, status: 'pending' });

  try {
    const sources = await axios.get('a');

    dispatch({
      type: FETCH_SOURCES,
      status: 'success',
      sources,
    });
  } catch (e) {
    dispatch({
      type: FETCH_SOURCES,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const createSource = (source) => async (dispatch) => {
  dispatch({ type: CREATE_SOURCE, status: 'pending' });

  try {
    const id = await axios.post('a', source);

    dispatch({
      type: CREATE_SOURCE,
      status: 'success',
      newSource: { ...source, id },
    });
  } catch (e) {
    dispatch({
      type: CREATE_SOURCE,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const updateSource = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_SOURCE, status: 'pending' });

  try {
    const endpoint = `/sources/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_SOURCE,
      status: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_SOURCE,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const deleteSources = (ids) => async (dispatch) => {
  dispatch({ type: DELETE_SOURCES, status: 'pending' });

  try {
    await axios.put('/sources/', ids);

    dispatch({
      type: DELETE_SOURCES,
      status: 'success',
      deletedIds: ids,
    });
  } catch (e) {
    dispatch({
      type: DELETE_SOURCES,
      status: 'error',
      errorMsg: e.message,
    });
  }
};
