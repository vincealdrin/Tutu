export const CHANGE_KEYWORDS = 'filters/CHANGE_KEYWORDS';
export const CHANGE_CATEGORIES = 'filters/CHANGE_CATEGORIES';
export const CHANGE_SOURCES = 'filters/CHANGE_SOURCES';
export const CHANGE_TIMEWINDOW = 'filters/CHANGE_TIMEWINDOW';
export const CHANGE_LIMIT = 'filters/CHANGE_LIMIT';
export const CHANGE_ORGANIZATIONS = 'filters/CHANGE_ORGANIZATIONS';
export const CHANGE_PEOPLE = 'filters/CHANGE_PEOPLE';
export const CHANGE_SENTIMENT = 'filters/CHANGE_SENTIMENT';
export const CHANGE_SOCIAL_SHARES = 'filters/CHANGE_SOCIAL_SHARES';
export const UPDATE_MAP_STATE = 'filters/UPDATE_MAP_STATE';

const initialState = {
  keywords: [],
  categories: [],
  organizations: [],
  people: [],
  sources: [],
  timeWindow: [24, 31],
  limit: 1500,
};

export default (state = initialState, action) => {
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
    case CHANGE_TIMEWINDOW:
      return {
        ...state,
        timeWindow: action.timeWindow,
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

export const changTimeWindowFilter = (timeWindow) => ({
  type: CHANGE_TIMEWINDOW,
  timeWindow,
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
