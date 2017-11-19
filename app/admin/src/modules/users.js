import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../../utils';

export const FETCH_USERS = 'users/FETCH_USERS';
export const CREATE_USER = 'users/CREATE_USER';
export const UPDATE_USER = 'users/UPDATE_USER';
export const DELETE_USERS = 'users/DELETE_USER';
export const DECREMENT = 'users/DECREMENT';

const initialState = {
  users: [],
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
        users: action.users || state.users,
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

export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: FETCH_USERS, status: 'pending' });

  try {
    const users = await axios.get('a');

    dispatch({
      type: FETCH_USERS,
      status: 'success',
      users,
    });
  } catch (e) {
    dispatch({
      type: FETCH_USERS,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const createUser = (user) => async (dispatch) => {
  dispatch({ type: CREATE_USER, status: 'pending' });

  try {
    const id = await axios.post('a', user);

    dispatch({
      type: CREATE_USER,
      status: 'success',
      newUser: { ...user, id },
    });
  } catch (e) {
    dispatch({
      type: CREATE_USER,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const updateUser = (userId, user, isIdChanged = false) => async (dispatch) => {
  dispatch({ type: UPDATE_USER, status: 'pending' });

  try {
    const endpoint = `/users/${userId}`;
    const path = isIdChanged ? `${endpoint}?isIdChanged=true` : endpoint;
    const updatedUser = await axios.put(path, user);

    dispatch({
      type: UPDATE_USER,
      status: 'success',
      updatedUser,
    });
  } catch (e) {
    dispatch({
      type: UPDATE_USER,
      status: 'error',
      errorMsg: e.message,
    });
  }
};

export const deleteUsers = (ids) => async (dispatch) => {
  dispatch({ type: DELETE_USERS, status: 'pending' });

  try {
    await axios.put('/users/', ids);

    dispatch({
      type: DELETE_USERS,
      status: 'success',
      deletedIds: ids,
    });
  } catch (e) {
    dispatch({
      type: DELETE_USERS,
      status: 'error',
      errorMsg: e.message,
    });
  }
};
