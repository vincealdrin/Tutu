import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_USERS = 'users/FETCH_USERS';
export const ADD_USER = 'users/ADD_USER';
export const UPDATE_USER = 'users/UPDATE_USER';
export const DELETE_USERS = 'users/DELETE_USER';
export const DECREMENT = 'users/DECREMENT';

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
        totalCount: action.totalCount,
        fetchStatus: updateCrudStatus(action),
      };
    case ADD_USER:
      return {
        ...state,
        users: action.statusText === 'success' ? [
          action.newUser,
          ...state.users,
        ] : state.users,
        addStatus: updateCrudStatus(action),
      };
    case UPDATE_USER:
      return {
        ...state,
        users: state.users.map((user) => {
          if (user.id === action.userId) {
            return action.updateUser;
          }
          return user;
        }),
        updateStatus: updateCrudStatus(action),
      };
    case DELETE_USERS:
      return {
        ...state,
        users: action.statusText === 'success'
          ? state.users.filter((user) => !action.deletedIds.includes(user.id))
          : state.users,
        deleteStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchUsers = (page, limit, filter, search) => async (dispatch) => {
  dispatch({ type: FETCH_USERS, statusText: 'pending' });

  try {
    const { data: users, status, headers } = await axios.get('/users', {
      params: {
        page,
        limit,
        filter,
        search,
      },
    });

    dispatch({
      type: FETCH_USERS,
      totalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      status,
      users,
    });
  } catch (e) {
    dispatch({
      type: FETCH_USERS,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMessage: e.response.data.message,
    });
  }
};

export const addUser = () => httpThunk(ADD_USER, async (getState) => {
  const { form } = getState();
  const userInfo = form.user.values;

  try {
    const { data: newUser, status } = await axios.post('/users', userInfo);

    return {
      newUser,
      status,
    };
  } catch (e) {
    return e;
  }
});

export const updateUser = (userId, user, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_USER, statusText: 'pending' });

  try {
    const endpoint = `/users/${userId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedUser = await axios.put(path, user);

    dispatch({
      type: UPDATE_USER,
      statusText: 'success',
      updatedUser,
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
