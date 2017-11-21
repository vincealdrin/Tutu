import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import 'semantic-ui-css/semantic.min.css';
import counter from './counter';
import users from './users';
import sources from './sources';
import articles from './articles';

export default combineReducers({
  router: routerReducer,
  counter,
  users,
  sources,
  articles,
});

