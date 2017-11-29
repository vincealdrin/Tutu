import axios from 'axios';
import { updateCrudStatus, crudStatus } from '../utils';

export const FETCH_LOGS = 'crawler/FETCH_LOGS';
export const ADD_LOG = 'crawler/ADD_LOG';
export const FETCH_STATS = 'crawler/FETCH_STATS';
export const FETCH_CRAWL_SCHEDULES = 'crawler/FETCH_CRAWL_SCHEDULES';
export const SCHEDULE_CRAWL = 'crawler/SCHEDULE_CRAWL';
export const START_CRAWL = 'crawler/START_CRAWL';
export const STOP_CRAWL = 'crawler/STOP_CRAWL';
export const INCREMENT_SUCCESS_COUNT = 'crawler/INCREMENT_SUCCESS_COUNT';
export const INCREMENT_ERROR_COUNT = 'crawler/INCREMENT_ERROR_COUNT';

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
    case ADD_LOG:
      return {
        ...state,
        logs: state.logs.length >= 30
          ? [action.newLog, ...state.logs.slice(1)]
          : [action.newLog, ...state.logs],
      };
    case INCREMENT_SUCCESS_COUNT:
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
    case INCREMENT_ERROR_COUNT:
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

export const fetchLogs = () => async (dispatch) => {
  dispatch({ type: FETCH_LOGS, statusText: 'pending' });

  try {
    const { data: logs } = await axios.get('/crawler/logs');

    dispatch({
      type: FETCH_LOGS,
      statusText: 'success',
      logs,
    });
  } catch (e) {
    dispatch({
      type: FETCH_LOGS,
      statusText: 'error',
      status: e.response.status,
    });
  }
};

export const addLog = (newLog) => ({ type: ADD_LOG, newLog });

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

export const incSuccessCount = () => ({ type: INCREMENT_SUCCESS_COUNT });
export const incErrorCount = () => ({ type: INCREMENT_ERROR_COUNT });
