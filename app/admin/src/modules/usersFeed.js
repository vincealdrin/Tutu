import axios from 'axios';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';

export const FETCH_USERS_FEED = 'usersFeed/FETCH_USERS_FEED';
export const ADD_LOG = 'usersFeed/ADD_LOG';

const initialState = {
  feed: [],
  fetchStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_FEED:
      return {
        ...state,
        feed: action.feed || state.feed,
        fetchStatus: updateCrudStatus(action),
      };
    case ADD_LOG:
      return {
        ...state,
        feed: state.feed.length >= 30
          ? [action.newFeedItem, ...state.feed.slice(0, state.feed.length - 1)]
          : [action.newFeedItem, ...state.feed],
      };
    default:
      return state;
  }
};

export const fetchUsersFeed = () => httpThunk(FETCH_USERS_FEED, async () => {
  try {
    const { data: feed } = await axios.get('/usersFeed');

    return ({
      type: FETCH_USERS_FEED,
      statusText: 'success',
      feed,
    });
  } catch (e) {
    return e;
  }
});

export const addFeedItem = (newFeedItem) => ({ type: ADD_LOG, newFeedItem });
