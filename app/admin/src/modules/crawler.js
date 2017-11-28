import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_LOGS = 'crawler/FETCH_LOGS';
export const FETCH_STATS = 'crawler/FETCH_STATS';
export const FETCH_CRAWL_SCHEDULES = 'crawler/FETCH_CRAWL_SCHEDULES';
export const SCHEDULE_CRAWL = 'crawler/SCHEDULE_CRAWL';
export const START_CRAWL = 'crawler/START_CRAWL';
export const STOP_CRAWL = 'crawler/STOP_CRAWL';
export const ADD_SUCCESS_COUNT = 'crawler/ADD_SUCCESS_COUNT';
export const ADD_ERROR_COUNT = 'crawler/ADD_ERROR_COUNT';

const initialState = {
  logs: [],
  stats: {
    labels: [],
    successCounts: [],
    errorCounts: [],
  },
  fetchLogsStatus: crudStatus,
  fetchStatsStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_LOGS:
      return {
        ...state,
        logs: action.logs || state.logs,
        fetchLogsStatus: updateCrudStatus(action),
      };
    case ADD_SUCCESS_COUNT:
      return {
        ...state,
        stats: {
          ...state.stats,
          successCounts: [
            ...state.stats.successCounts.slice(0, -1),
            state.stats.successCounts.pop() + 1,
          ],
        },
      };
    case ADD_ERROR_COUNT:
      return {
        ...state,
        stats: {
          ...state.stats,
          errorCounts: [
            ...state.stats.errorCounts.slice(0, -1),
            state.stats.errorCounts.pop() + 1,
          ],
        },
      };
    case FETCH_STATS:
      return {
        ...state,
        stats: action.stats ? {
          labels: action.stats.map((stat) => new Date(stat.date).toLocaleDateString()),
          successCounts: action.stats.map((stat) => stat.successCount),
          errorCounts: action.stats.map((stat) => stat.errorCount),
        } : state.stats,
        fetchStatsStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchStats = (cb) => async (dispatch) => {
  dispatch({ type: FETCH_STATS, statusText: 'pending' });

  try {
    const { data: stats } = await axios.get('/crawler/stats');

    dispatch({
      type: FETCH_STATS,
      statusText: 'success',
      stats,
    });
  } catch (e) {
    dispatch({
      type: FETCH_STATS,
      statusText: 'error',
      status: e.response.status,
    });
  }

  if (cb) cb();
};

export const incSuccessCount = () => ({ type: ADD_SUCCESS_COUNT });
export const incErrorCount = () => ({ type: ADD_ERROR_COUNT });
