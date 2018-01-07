import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_USERS = 'users/FETCH_USERS';
export const ADD_USERS = 'users/ADD_USERS';
export const UPDATE_USER = 'users/UPDATE_USER';
export const DELETE_USERS = 'users/DELETE_SOURCE';

const initialState = {
  users: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  addStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS:
      return {
        ...state,
        users: action.users || state.users,
        fetchStatus: updateCrudStatus(action),
        totalCount: action.totalCount || state.totalCount,
      };
    case ADD_USERS:
      return {
        ...state,
        users: action.statusText === 'success' ? [
          action.newUser,
          ...state.users,
        ] : state.users,
        totalCount: action.statusText === 'success'
          ? state.totalCount + 1
          : state.totalCount,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_USER:
      return {
        ...state,
        users: state.users.map((source) => {
          if (source.id === action.sourceId) {
            return action.updatedUser;
          }
          return source;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_USERS:
      return {
        ...state,
        users: action.statusText === 'success'
          ? state.users.filter((user) => !action.deletedIds.includes(user.id))
          : state.users,
        totalCount: action.statusText === 'success'
          ? state.totalCount - action.deletedIds.length
          : state.totalCount,
        updateStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchUsers = (page, limit, filter, search) =>
  httpThunk(FETCH_USERS, async () => {
    try {
      const { data: users, status, headers } = await axios.get('/users', {
        params: {
          page,
          limit,
          filter,
          search,
        },
      });

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        users,
        status,
      };
    } catch (e) {
      return e;
    }
  });


export const addUser = () => httpThunk(ADD_USERS, async (getState) => {
  const { form } = getState();

  try {
    const { data: newUser, status } = await axios.post('/users', {
      ...form.user.values,
    });

    return {
      newUser,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updateUser = (sourceId, source, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_USER, statusText: 'pending' });

  try {
    const endpoint = `/users/${sourceId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedSource = await axios.put(path, source);

    dispatch({
      type: UPDATE_USER,
      statusText: 'success',
      updatedSource,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_USER,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const deleteUsers = (ids) => httpThunk(DELETE_USERS, async () => {
  try {
    const { status } = await axios.delete('/users', {
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
