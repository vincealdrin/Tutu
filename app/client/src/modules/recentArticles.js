export const ADD_RECENT_ARTICLE = 'recentArticles/ADD_RECENT_ARTICLE';

const initialState = {
  articles: [],
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_RECENT_ARTICLE:
      return {
        ...state,
        articles: [
          ...state.articles,
          action.newArticles,
        ],
      };
    default:
      return state;
  }
};

export const addRecentArticle = (newArticle) => (dispatch) => {
  dispatch({
    type: ADD_RECENT_ARTICLE,
    newArticle,
  });
};
