import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import counter from './counter';
import mapArticles from './mapArticles';
import recentArticles from './recentArticles';
import popularArticles from './popularArticles';
import filters from './filters';

export default combineReducers({
  router: routerReducer,
  counter,
  mapArticles,
  recentArticles,
  popularArticles,
  filters,
});

