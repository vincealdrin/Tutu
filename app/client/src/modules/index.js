import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { nprogress } from 'redux-nprogress';
import io from 'socket.io-client';
import mapArticles from './mapArticles';
import recentArticles from './recentArticles';
import popularArticles from './popularArticles';
import filters from './filters';
import insights from './insights';
import mapThemes from './mapThemes';

const socket = io.connect('/client');
export default combineReducers({
  router: routerReducer,
  socket: () => socket,
  nprogress,
  mapArticles,
  recentArticles,
  popularArticles,
  filters,
  insights,
  mapThemes,
});

