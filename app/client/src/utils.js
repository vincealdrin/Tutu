import { Cancel } from 'axios';
import { beginTask, endTask } from 'redux-nprogress';

export const updateCrudStatus = (action) => ({
  pending: action.statusText === 'pending',
  success: action.statusText === 'success',
  error: action.statusText === 'error',
  cancelled: action.statusText === 'cancelled',
  status: action.status || null,
  errorMessage: action.errorMessage || '',
});

export const crudStatus = {
  pending: false,
  success: false,
  error: false,
  cancelled: false,
  status: null,
  errorMessage: '',
};

export const mapOptions = (opt) => ({
  key: opt,
  text: opt,
  value: opt,
});

export const articleId = (info) => `${info.title}-${info.source}-${info.publishDate}`;

export const httpThunk = (type, cb) => async (dispatch, getState) => {
  dispatch({ statusText: 'pending', type });
  dispatch(beginTask());
  const payload = await cb(getState, dispatch);

  if (payload instanceof Error) {
    const {
      response = {
        data: { message: '' },
        status: 500,
      },
    } = payload;
    dispatch({
      statusText: 'error',
      errorMessage: response.data.message,
      status: response.status,
      type,
    });
  } else if (payload instanceof Cancel) {
    dispatch({ statusText: 'cancelled', type });
  } else {
    dispatch({
      ...payload,
      statusText: 'success',
      type,
    });
  }
  dispatch(endTask());
};

export const getBarDataset = (dataset) => dataset.map(({
  label,
  data,
  color,
}) => ({
  label,
  data: [data],
  backgroundColor: `rgba(${color},0.2)`,
  borderColor: `rgba(${color},1)`,
  borderWidth: 1,
  barThickness: 1,
  hoverBackgroundColor: `rgba(${color},0.4)`,
  hoverBorderColor: `rgba(${color},1)`,
}));

export const getLineDataset = (dataset) => dataset.map(({
  label,
  data,
  color,
}) => ({
  label,
  data,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(${color},0.4)`,
  borderColor: `rgba(${color},1)`,
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: `rgba(${color},1)`,
  pointBackgroundColor: '#fff',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: `rgba(${color},1)`,
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
}));
