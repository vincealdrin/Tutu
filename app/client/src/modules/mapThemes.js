import axios from 'axios';

export const FETCH_MAP_STYLES = 'mapThemes/FETCH_MAP_STYLES';

const initialState = {
  styles: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MAP_STYLES:
      return {
        ...state,
        themes: action.styles,
      };
    default:
      return state;
  }
};

export const fetchMapStyle = () => async (dispatch) => {
  dispatch({ type: FETCH_MAP_STYLES, statusText: 'pending' });

  try {
    const { data: styles, status } = await axios.get('https://snazzymaps.com/explore.json', {
      params: {
        key: '73a29a0d-d359-451c-a4e8-c9d9630eb46f',
      },
    });

    dispatch({
      type: FETCH_MAP_STYLES,
      statusText: 'success',
      styles,
      status,
    });
  } catch (e) {
    dispatch({
      type: FETCH_MAP_STYLES,
      statusText: 'error',
      status: e.response ? e.response.status : 500,
      errorMsg: e.response.data.msg,
    });
  }
};
