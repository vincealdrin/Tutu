export const CHANGE_KEYWORDS_FILTER = 'mapArticles/CHANGE_KEYWORDS_FILTER';
export const CHANGE_CATEGORIES_FILTER = 'mapArticles/CHANGE_CATEGORIES_FILTER';
export const CHANGE_SOURCES_FILTER = 'mapArticles/CHANGE_SOURCES_FILTER';
export const CHANGE_TIMEWINDOW_FILTER = 'mapArticles/CHANGE_TIMEWINDOW_FILTER';
export const CHANGE_LIMIT_FILTER = 'mapArticles/CHANGE_LIMIT_FILTER';
export const UPDATE_MAP_STATE = 'mapArticles/UPDATE_MAP_STATE';

const initialState = {
  keywords: [],
  categories: [],
  sources: [],
  timeWindow: {
    start: 7,
    end: 0,
  },
  limit: 1500,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_KEYWORDS_FILTER:
      return {
        ...state,
        keywords: action.keywords,
      };
    case CHANGE_CATEGORIES_FILTER:
      return {
        ...state,
        categories: action.categories,
      };
    case CHANGE_SOURCES_FILTER:
      return {
        ...state,
        sources: action.sources,
      };
    case CHANGE_TIMEWINDOW_FILTER:
      return {
        ...state,
        timeWindow: action.timeWindow,
      };
    case CHANGE_LIMIT_FILTER:
      return {
        ...state,
        limit: action.limit,
      };
    default:
      return state;
  }
};

export const changeKeywordsFilter = (keywords) => ({
  type: CHANGE_KEYWORDS_FILTER,
  keywords,
});

export const changeCategoriesFilter = (categories) => ({
  type: CHANGE_CATEGORIES_FILTER,
  categories,
});

export const changeSourcesFilter = (sources) => ({
  type: CHANGE_SOURCES_FILTER,
  sources,
});

export const changTimeWindowFilter = (timeWindow) => ({
  type: CHANGE_TIMEWINDOW_FILTER,
  timeWindow,
});

export const changeLimitFilter = (limit) => ({
  type: CHANGE_LIMIT_FILTER,
  limit,
});
