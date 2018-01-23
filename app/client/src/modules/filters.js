import moment from 'moment';

export const CHANGE_KEYWORDS = 'filters/CHANGE_KEYWORDS';
export const CHANGE_CATEGORIES = 'filters/CHANGE_CATEGORIES';
export const CHANGE_SOURCES = 'filters/CHANGE_SOURCES';
export const CHANGE_TIME_WINDOW = 'filters/CHANGE_TIME_WINDOW';
export const CHANGE_DATE = 'filters/CHANGE_DATE';
export const CHANGE_LIMIT = 'filters/CHANGE_LIMIT';
export const CHANGE_ORGANIZATIONS = 'filters/CHANGE_ORGANIZATIONS';
export const CHANGE_PEOPLE = 'filters/CHANGE_PEOPLE';
export const CHANGE_SENTIMENT = 'filters/CHANGE_SENTIMENT';
export const CHANGE_TOP_POPULAR = 'filters/CHANGE_TOP_POPULAR';
export const UPDATE_MAP_STATE = 'filters/UPDATE_MAP_STATE';
export const CLEAR_FILTERS = 'filters/CLEAR_FILTERS';

export const filtersInitialState = {
  keywords: [],
  categories: [],
  organizations: [],
  people: [],
  sources: [],
  sentiment: 'none',
  topPopular: 'none',
  timeWindow: [28, 31],
  date: moment(),
  limit: 1500,
};

export default (state = filtersInitialState, action) => {
  switch (action.type) {
    case CHANGE_KEYWORDS:
      return {
        ...state,
        keywords: action.keywords,
      };
    case CHANGE_CATEGORIES:
      return {
        ...state,
        categories: action.categories,
      };
    case CHANGE_SOURCES:
      return {
        ...state,
        sources: action.sources,
      };
    case CHANGE_TIME_WINDOW:
      return {
        ...state,
        timeWindow: action.timeWindow,
      };
    case CHANGE_DATE:
      return {
        ...state,
        date: action.date,
      };
    case CHANGE_LIMIT:
      return {
        ...state,
        limit: action.limit,
      };
    case CHANGE_ORGANIZATIONS:
      return {
        ...state,
        organizations: action.organizations,
      };
    case CHANGE_PEOPLE:
      return {
        ...state,
        people: action.people,
      };
    case CHANGE_TOP_POPULAR:
      return {
        ...state,
        topPopular: action.topPopular,
      };
    case CHANGE_SENTIMENT:
      return {
        ...state,
        sentiment: action.sentiment,
      };
    case CLEAR_FILTERS:
      return filtersInitialState;
    default:
      return state;
  }
};

export const changeKeywordsFilter = (keywords) => ({
  type: CHANGE_KEYWORDS,
  keywords,
});

export const changeCategoriesFilter = (categories) => ({
  type: CHANGE_CATEGORIES,
  categories,
});

export const changeSourcesFilter = (sources) => ({
  type: CHANGE_SOURCES,
  sources,
});

export const changeTimeWindowFilter = (timeWindow) => ({
  type: CHANGE_TIME_WINDOW,
  timeWindow,
});

export const changeDateFilter = (date) => ({
  type: CHANGE_DATE,
  date,
});

export const changeOrganizationsFilter = (organizations) => ({
  type: CHANGE_ORGANIZATIONS,
  organizations,
});

export const changePeopleFilter = (people) => ({
  type: CHANGE_PEOPLE,
  people,
});

export const changeLimitFilter = (limit) => ({
  type: CHANGE_LIMIT,
  limit,
});

export const changeSentimentFilter = (sentiment) => ({
  type: CHANGE_SENTIMENT,
  sentiment,
});

export const changeTopPopular = (topPopular) => ({
  type: CHANGE_TOP_POPULAR,
  topPopular,
});

export const clearFilters = () => ({
  type: CLEAR_FILTERS,
});
