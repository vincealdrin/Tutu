import axios from 'axios';
import moment from 'moment';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';
import { DATE_FORMAT } from '../../constants';

export const FETCH_COUNTS = 'dashboard/FETCH_COUNTS';
export const FETCH_SOURCES_SUBMIT = 'dashboard/FETCH_SOURCES_SUBMIT';
export const FETCH_SENTIMENT_TIME = 'dashboard/FETCH_SENTIMENT_TIME';
export const FETCH_CATEGORIES_TIME = 'dashboard/FETCH_CATEGORIES_TIME';
export const FETCH_TOP_PEOPLE = 'dashboard/FETCH_TOP_PEOPLE';
export const FETCH_TOP_ORGS = 'dashboard/FETCH_TOP_ORGS';
export const FETCH_TOP_KEYWORDS = 'dashboard/FETCH_TOP_KEYWORDS';
export const FETCH_TOP_LOCATIONS = 'dashboard/FETCH_TOP_LOCATIONS';

const initialState = {
  sourcesSubmit: {
    verifiedSources: [],
    pendingSources: [],
  },
  counts: {
    visitors: 0,
    articles: 0,
    pendingSources: 0,
    credibleSources: 0,
    notCredibleSources: 0,
  },
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
  fetchCountsStatus: crudStatus,
  fetchSentimentStatus: crudStatus,
  fetchCategoriesStatus: crudStatus,
  fetchTopPeopleStatus: crudStatus,
  fetchTopOrgsStatus: crudStatus,
  fetchTopLocationsStatus: crudStatus,
  fetchTopKeywordsStatus: crudStatus,
  fetchSourcesSubmitStatus: crudStatus,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_SOURCES_SUBMIT:
      return {
        ...state,
        sourcesSubmit: action.sourcesSubmit ? {
          verifiedSources: {
            labels: action.sourcesSubmit.verifiedSources
              .map((vs) => moment(vs.date).format(DATE_FORMAT)),
            credibleCount: action.sourcesSubmit.verifiedSources.map((vs) => vs.credible),
            notCredibleCount: action.sourcesSubmit.verifiedSources.map((vs) => vs.notCredible),
          },
          pendingSources: {
            labels: action.sourcesSubmit.pendingSources
              .map((vs) => moment(vs.date).format(DATE_FORMAT)),
            pendingCount: action.sourcesSubmit.pendingSources.map((ps) => ps.pending),
          },
        } : state.sourcesSubmit,
        fetchSourcesSubmitStatus: updateCrudStatus(action),
      };
    case FETCH_COUNTS:
      return {
        ...state,
        counts: { ...action.counts } || state.counts,
        fetchCountsStatus: updateCrudStatus(action),
      };
    case FETCH_SENTIMENT_TIME:
      return {
        ...state,
        sentiment: action.insights ? {
          labels: action.insights.map((insight) => moment(insight.date).format(DATE_FORMAT)),
          posCount: action.insights
            .map((insight) => insight.sentiment.pos),
          neuCount: action.insights
            .map((insight) => insight.sentiment.neu),
          negCount: action.insights
            .map((insight) => insight.sentiment.neg),
        } : state.sentiment,
        fetchSentimentStatus: updateCrudStatus(action),
      };
    case FETCH_CATEGORIES_TIME:
      return {
        ...state,
        categories: action.insights ? {
          labels: action.insights.map((insight) => moment(insight.date).format(DATE_FORMAT)),
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


export const fetchTopInsights = (field, limit) => {
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
      const { data: insights, status } = await axios.get('/dashboard/top', {
        params: {
          field,
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


export const fetchSentimentInsights = () =>
  httpThunk(FETCH_SENTIMENT_TIME, async () => {
    try {
      const { data: insights, status } = await axios.get('/dashboard/sentiment');

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchCategoriesInsights = () =>
  httpThunk(FETCH_CATEGORIES_TIME, async () => {
    try {
      const { data: insights, status } = await axios.get('/dashboard/categories');

      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchCounts = () =>
  httpThunk(FETCH_COUNTS, async () => {
    try {
      const { data: counts, status } = await axios.get('/dashboard/counts');

      return {
        statusText: 'success',
        counts,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchSourcesSubmit = () =>
  httpThunk(FETCH_SOURCES_SUBMIT, async () => {
    try {
      const { data: sourcesSubmit, status } = await axios.get('/dashboard/sourcesSubmit');

      return {
        statusText: 'success',
        sourcesSubmit,
        status,
      };
    } catch (e) {
      return e;
    }
  });
