import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import rootReducer from './modules';
import { crudStatus } from './utils';

export const history = createHistory();

const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
const initialState = {
  user: {
    info: userInfo.info || {},
    token: userInfo.token || '',
    isLogin: !!userInfo.token,
    loginStatus: crudStatus,
  },
};

const enhancers = [];
const middleware = [
  thunk,
  routerMiddleware(history),
];

if (process.env.NODE_ENV === 'development') {
  const { devToolsExtension } = window;

  if (typeof devToolsExtension === 'function') {
    enhancers.push(devToolsExtension());
  }
}

const composedEnhancers = compose(
  applyMiddleware(...middleware),
  ...enhancers,
);

const store = createStore(
  rootReducer,
  initialState,
  composedEnhancers,
);

if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept('./modules', () => {
      store.replaceReducer(rootReducer);
    });
  }
}

export default store;
