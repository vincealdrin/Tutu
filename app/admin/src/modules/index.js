import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import io from 'socket.io-client';
import counter from './counter';
import users from './users';
import sources from './sources';
import articles from './articles';
import crawler from './crawler';

const socket = io.connect('http://localhost:5000');
export default combineReducers({
  router: routerReducer,
  socket: () => socket,
  counter,
  users,
  sources,
  articles,
  crawler,
});

