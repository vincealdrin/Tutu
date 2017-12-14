import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import io from 'socket.io-client';
import counter from './counter';
import users from './users';
import sources from './sources';
import articles from './articles';
import crawler from './crawler';

const socket = io.connect('/');
export default combineReducers({
  form: formReducer,
  router: routerReducer,
  socket: () => socket,
  counter,
  users,
  sources,
  articles,
  crawler,
});

