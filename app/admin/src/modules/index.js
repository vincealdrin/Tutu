import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import io from 'socket.io-client';
import counter from './counter';
import users from './users';
import usersFeed from './usersFeed';
import sources from './sources';
import pendingSources from './pendingSources';
import articles from './articles';
import crawler from './crawler';
import dashboard from './dashboard';
import user, { LOGOUT } from './user';

const socket = io.connect('/');
const appReducer = combineReducers({
  form: formReducer,
  router: routerReducer,
  socket: () => socket,
  counter,
  users,
  usersFeed,
  sources,
  pendingSources,
  articles,
  crawler,
  dashboard,
  user,
});
const rootReducer = (state, action) => {
  const appState = action.type === LOGOUT ? undefined : state;
  return appReducer(appState, action);
};

export default rootReducer;
