import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_USERS = 'users/FETCH_USERS';
export const CREATE_USER = 'users/CREATE_USER';
export const UPDATE_USER = 'users/UPDATE_USER';
export const DELETE_USERS = 'users/DELETE_USER';
export const DECREMENT = 'users/DECREMENT';

const initialState = {
  users: [],
  totalCount: 0,
  fetchStatus: crudStatus,
  createStatus: crudStatus,
  updateStatus: crudStatus,
  deleteStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS:
      return {
        ...state,
        users: [
          ...state.users,
          ...action.users,
        ],
        totalCount: action.totalCount,
        fetchStatus: updateCrudStatus(action),
      };
    case CREATE_USER:
      return {
        ...state,
        users: [
          ...action.users,
          action.newUser,
        ],
        createStatus: updateCrudStatus(action),
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
        users: state.users.filter((user) => action.deletedIds.includes(user.id)),
        updateStatus: updateCrudStatus(action),
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
      usersTotalCount: parseInt(headers['x-total-count'], 10),
      statusText: 'success',
      status,
      users,
    });
  } catch (e) {
    dispatch({
      type: FETCH_USERS,
      statusText: 'error',
      status: e.response.status,
    });
  }
};

export const createUser = (user) => async (dispatch) => {
  dispatch({ type: CREATE_USER, statusText: 'pending' });

  try {
    const id = await axios.post('/users', user);

    dispatch({
      type: CREATE_USER,
      statusText: 'success',
      newUser: { ...user, id },
    });
  } catch (e) {
    dispatch({
      type: CREATE_USER,
      statusText: 'error',
      status: e.response.status,
    });
  }
};

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
      status: e.response.status,
    });
  }
};

export const deleteUsers = (ids) => async (dispatch) => {
  dispatch({ type: DELETE_USERS, statusText: 'pending' });

  try {
    await axios.put('/users/', ids);

    dispatch({
      type: DELETE_USERS,
      statusText: 'success',
      deletedIds: ids,
    });
  } catch (e) {
    dispatch({
      type: DELETE_USERS,
      statusText: 'error',
      status: e.response.status,
    });
  }
};
