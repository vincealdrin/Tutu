import {
  createStore,
  applyMiddleware,
  compose,
} from 'redux';
import {
  routerMiddleware,
} from 'react-router-redux';
import moment from 'moment';
import thunk from 'redux-thunk';
import createHistory from 'history/createBrowserHistory';
import { nprogressMiddleware } from 'redux-nprogress';
import rootReducer from './modules';
import {
  filtersInitialState,
} from './modules/filters';

export const history = createHistory();

const filterSettings = JSON.parse(localStorage.getItem('filterSettings'));
const initialState = {
  filters: filterSettings ? {
    ...filterSettings,
    date: moment(filterSettings.date),
  } : filtersInitialState,
};
const enhancers = [];
const middleware = [
  thunk,
  nprogressMiddleware(),
  routerMiddleware(history),
];

if (process.env.NODE_ENV === 'development') {
  const {
    devToolsExtension,
  } = window;

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
