import axios from 'axios';

export const FETCH_MAPSTYLES = 'mapThemes/FETCH_MAPSTYLES';

const initialState = {
  themes: [],
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

export const fetchMapStyle = (key, themes) => async (dispatch, getState) => {
  dispatch({
    type: FETCH_MAPSTYLES,
    themes: {
      themes,
    },
  });
  dispatch({ type: FETCH_MAPSTYLES, statusText: 'pending' });

  try {
    const { styles } = getState();
    const { data: mapStyle, status } = await axios.get('https://snazzymaps.com/explore.json?key=73a29a0d-d359-451c-a4e8-c9d9630eb46f', {
      params: {
        id: styles.id.join(),
        name: styles.name.join(),
        url: styles.url.join(),
        imageUrl: styles.imageUrl.join(),
      },
    });

    dispatch({
      type: FETCH_MAPSTYLES,
      statusText: 'success',
      mapStyle,
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
