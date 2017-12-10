export const updateCrudStatus = (action) => ({
  pending: action.statusText === 'pending',
  success: action.statusText === 'success',
  error: action.statusText === 'error',
  status: action.status,
  errorMsg: action.errorMsg,
});

export const crudStatus = {
  pending: false,
  success: false,
  error: false,
  status: null,
  errorMsg: '',
};

export const mapOptions = (opt) => ({
  key: opt,
  text: opt,
  value: opt,
});

export const errPayload = (type, e) => ({
  statusText: 'error',
  status: e.response ? e.response.status : 500,
  errorMsg: e.response.data.msg,
  type,
});

export const httpThunk = (type, cb) => async (dispatch, getState) => {
  dispatch({ statusText: 'pending', type });
  const payload = await cb(getState);

  if (payload instanceof Error) {
    const { response } = payload;
    dispatch({
      statusText: 'error',
      status: response ? response.status : 500,
      errorMsg: response.data.msg,
      type,
    });
  } else {
    dispatch({
      ...payload,
      statusText: 'success',
      type,
    });
  }
};
