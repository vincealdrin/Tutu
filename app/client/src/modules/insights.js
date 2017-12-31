import axios from 'axios';
import { crudStatus, updateCrudStatus, httpThunk } from '../utils';

export const FETCH_INSIGHTS = 'insights/FETCH_INSIGHTS';

const initialState = {
  insights: [],
  fetchStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_INSIGHTS:
      return {
        ...state,
        insights: action.insights || state.insights,
        fetchStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchInsights = (ids) =>
  httpThunk(FETCH_INSIGHTS, () => async (dispatch) => {
    dispatch({ type: FETCH_INSIGHTS, statusText: 'pending' });

    try {
      const { data: insights, status } = await axios.get('/insights', {
        params: {
          ids,
        },
      });

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

