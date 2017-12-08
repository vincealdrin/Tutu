import axios from 'axios';

export const FETCH_MAPSTYLES = 'mapThemes/FETCH_MAPSTYLES';

const initialState = {
  themes: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MAPSTYLES:
      return {
        ...state,
        themes: action.themes,
      };
    default:
      return state;
  }
};

export const fetchMapStyle = () => async (dispatch) => {
  dispatch({ type: FETCH_MAPSTYLES, statusText: 'pending' });

  try {
    const { data: themes, status } = await axios.get('https://snazzymaps.com/explore.json', {
      params: {
        key: '73a29a0d-d359-451c-a4e8-c9d9630eb46f'
      },
    });

    dispatch({
      type: FETCH_MAPSTYLES,
      statusText: 'success',
      themes,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_MAPSTYLES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
    });
  }
};
