import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import 'semantic-ui-css/semantic.min.css';
import counter from './counter';
import articleItems from './articles';

export default combineReducers({
  router: routerReducer,
	counter,
	articleItems
});

