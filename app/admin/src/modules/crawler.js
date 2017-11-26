import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_LOGS = 'crawler/FETCH_LOGS';
export const FETCH_CRAWL_SCHEDULES = 'crawler/FETCH_CRAWL_SCHEDULES';
export const SCHEDULE_CRAWL = 'crawler/SCHEDULE_CRAWL';
export const START_CRAWL = 'crawler/START_CRAWL';
export const STOP_CRAWL = 'crawler/STOP_CRAWL';

const initialState = {
  logs: [],
  fetchLogsStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LOGS:
      return {
        ...state,
        logs: action.logs || state.logs,
        fetchLogsStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchSources = () => async (dispatch) => {
  dispatch({ type: FETCH_LOGS, statusText: 'pending' });

  try {
    const sources = await axios.get('a');

    dispatch({
      type: FETCH_SOURCES,
      statusText: 'success',
      sources,
    });
  } catch (e) {
    dispatch({
      type: FETCH_SOURCES,
      statusText: 'error',
      status: e.response.status,
    });
  }
};
