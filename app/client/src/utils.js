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

export const httpThunk = (type, cb) => async (dispatch, getState) => {
  dispatch({ statusText: 'pending', type });
  const payload = await cb(getState, dispatch);

  if (payload instanceof Error) {
    const {
      response = {
        data: { msg: '' },
        status: 500,
      },
    } = payload;
    dispatch({
      statusText: 'error',
      errorMsg: response.data.msg,
      status: response.status,
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
