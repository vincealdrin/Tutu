export const updateCrudStatus = (action) => ({
  pending: action.status === 'pending',
  success: action.status === 'success',
  error: action.status === 'error' ? action.errorMsg : null,
});

export const crudStatus = {
  pending: false,
  success: false,
  error: false,
};
