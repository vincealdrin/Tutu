import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import io from 'socket.io-client';
import counter from './counter';
import mapArticles from './mapArticles';
import recentArticles from './recentArticles';
import popularArticles from './popularArticles';
import filters from './filters';
import mapThemes from './mapThemes';

const socket = io.connect('http://localhost:3000/client');
export default combineReducers({
  router: routerReducer,
  socket: () => socket,
  counter,
  mapArticles,
  recentArticles,
  popularArticles,
  filters,
  mapThemes,
});

