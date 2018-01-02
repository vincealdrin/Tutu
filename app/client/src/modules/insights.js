import axios from 'axios';
import { crudStatus, updateCrudStatus, httpThunk } from '../utils';

export const FETCH_SENTIMENT = 'insights/FETCH_SENTIMENT';
export const FETCH_CATEGORIES = 'insights/FETCH_CATEGORIES';
export const FETCH_TOP_PEOPLE = 'insights/FETCH_TOP_PEOPLE';
export const FETCH_TOP_ORGS = 'insights/FETCH_TOP_ORGS';
export const FETCH_TOP_KEYWORDS = 'insights/FETCH_TOP_KEYWORDS';
export const FETCH_TOP_LOCATIONS = 'insights/FETCH_TOP_LOCATIONS';

const initialState = {
  sentiment: {
    labels: [],
    posCount: [],
    neuCount: [],
    negCount: [],
  },
  categories: {
    labels: [],
    econCount: [],
    lifeCount: [],
    sportsCount: [],
    polCount: [],
    healthCount: [],
    crimeCount: [],
    weatherCount: [],
    cultureCount: [],
    nationCount: [],
    envCount: [],
    busFinCount: [],
    disAccCount: [],
    entArtCount: [],
    lawGovCount: [],
    sciTechCount: [],
  },
  topPeople: [],
  topOrgs: [],
  topLocations: [],
  topKeywords: [],
  fetchSentimentStatus: crudStatus,
  fetchCategoriesStatus: crudStatus,
  fetchTopPeopleStatus: crudStatus,
  fetchTopOrgsStatus: crudStatus,
  fetchTopLocationsStatus: crudStatus,
  fetchTopKeywordsStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SENTIMENT:
      return {
        ...state,
        sentiment: action.insights ? {
          labels: action.insights.map((insight) => new Date(insight.date).toLocaleDateString()),
          posCount: action.insights
            .map((insight) => insight.sentiment.pos),
          neuCount: action.insights
            .map((insight) => insight.sentiment.neu),
          negCount: action.insights
            .map((insight) => insight.sentiment.neg),
        } : state.sentiment,
        fetchSentimentStatus: updateCrudStatus(action),
      };
    case FETCH_CATEGORIES:
      return {
        ...state,
        categories: action.insights ? {
          labels: action.insights.map((insight) => new Date(insight.date).toLocaleDateString()),
          econCount: action.insights
            .map((insight) => insight.categories.Economy),
          lifeCount: action.insights
            .map((insight) => insight.categories.Lifestyle),
          sportsCount: action.insights
            .map((insight) => insight.categories.Sports),
          polCount: action.insights
            .map((insight) => insight.categories.Politics),
          healthCount: action.insights
            .map((insight) => insight.categories.Health),
          crimeCount: action.insights
            .map((insight) => insight.categories.Crime),
          weatherCount: action.insights
            .map((insight) => insight.categories.Weather),
          cultureCount: action.insights
            .map((insight) => insight.categories.Culture),
          nationCount: action.insights
            .map((insight) => insight.categories.Nation),
          envCount: action.insights
            .map((insight) => insight.categories.Environment),
          busFinCount: action.insights
            .map((insight) => insight.categories['Business & Finance']),
          disAccCount: action.insights
            .map((insight) => insight.categories['Disaster & Accident']),
          entArtCount: action.insights
            .map((insight) => insight.categories['Entertainment & Arts']),
          lawGovCount: action.insights
            .map((insight) => insight.categories['Law & Government']),
          sciTechCount: action.insights
            .map((insight) => insight.categories['Science & Technology']),
        } : state.categories,
        fetchCategoriesStatus: updateCrudStatus(action),
      };
    case FETCH_TOP_PEOPLE:
      return {
        ...state,
        topPeople: action.insights || state.topPeople,
        fetchTopPeopleStatus: updateCrudStatus(action),
      };
    case FETCH_TOP_ORGS:
      return {
        ...state,
        topOrgs: action.insights || state.topOrgs,
        fetchTopOrgsStatus: updateCrudStatus(action),
      };
    case FETCH_TOP_LOCATIONS:
      return {
        ...state,
        topLocations: action.insights || state.topLocations,
        fetchTopLocationsStatus: updateCrudStatus(action),
      };
    case FETCH_TOP_KEYWORDS:
      return {
        ...state,
        topKeywords: action.insights || state.topKeywords,
        fetchTopKeywordsStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const fetchTopInsights = (ids, field, limit) => {
  let actionType = '';

  if (field === 'people') {
    actionType = FETCH_TOP_PEOPLE;
  } else if (field === 'organizations') {
    actionType = FETCH_TOP_ORGS;
  } else if (field === 'locations') {
    actionType = FETCH_TOP_LOCATIONS;
  } else {
    actionType = FETCH_TOP_KEYWORDS;
  }

  return httpThunk(actionType, async () => {
    try {
      const { data: insights, status } = await axios.get('/insights/top', {
        params: {
          field,
          ids,
          limit,
        },
      });

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });
};


export const fetchSentimentInsights = (ids) =>
  httpThunk(FETCH_SENTIMENT, async () => {
    try {
      const { data: insights, status } = await axios.get('/insights/sentiment', {
        params: {
          ids,
        },
      });

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchCategoriesInsights = (ids) =>
  httpThunk(FETCH_CATEGORIES, async () => {
    try {
      const { data: insights, status } = await axios.get('/insights/categories', {
        params: {
          ids,
        },
      });

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

