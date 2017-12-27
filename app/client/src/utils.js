import { Cancel } from 'axios';

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
};
