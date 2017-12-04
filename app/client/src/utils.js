export const updateCrudStatus = (action) => ({
  pending: action.statusText === 'pending',
  success: action.statusText === 'success',
  error: action.statusText === 'error',
  status: action.status,
});

export const crudStatus = {
  pending: false,
  success: false,
  error: false,
  status: null,
};

export const mapOptions = (opt) => ({
  key: opt,
  text: opt,
  value: opt,
});
