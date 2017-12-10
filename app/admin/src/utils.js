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

export const errPayload = (type, e) => ({
  statusText: 'error',
  status: e.response ? e.response.status : 500,
  errorMsg: e.response.data.msg,
  type,
});
