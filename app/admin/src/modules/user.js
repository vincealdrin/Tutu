import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const LOGIN = 'user/LOGIN';
export const LOGOUT = 'user/LOGOUT';

const initialState = {
  info: {},
  token: '',
  loginStatus: crudStatus,
  isLogin: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        info: action.info,
        token: action.token,
        loginStatus: updateCrudStatus(action),
        isLogin: action.statusText === 'success',
      };
    default:
      return state;
  }
};

export const login = () => httpThunk(LOGIN, async (getState) => {
  try {
    const { form: { login: loginForm } } = getState();
    const { username, password } = loginForm.values;
    const { data: user, status } = await axios({
      method: 'post',
      baseURL: '/api/auth',
      url: '/login',
      data: {
        username,
        password,
      },
    });

    axios.defaults.headers.common.Authorization = user.token;

    localStorage.setItem('userInfo', JSON.stringify({
      info: user.user,
      token: user.token,
    }));

    return {
      status,
      info: user.user,
      token: user.token,
    };
  } catch (e) {
    return e;
  }
});

export const logout = () => {
  localStorage.removeItem('userInfo');
  axios.defaults.headers.common.Authorization = '';

  return {
    type: LOGOUT,
  };
};
