import axios from 'axios';
import moment from 'moment';
import { updateCrudStatus, crudStatus, httpThunk } from '../utils';
import { DATE_FORMAT } from '../constants';

export const FETCH_USERS_COUNTS = 'dashboard/FETCH_USERS_COUNTS';
export const FETCH_ARTICLES_COUNTS = 'dashboard/FETCH_ARTICLES_COUNTS';
export const FETCH_SOURCES_COUNTS = 'dashboard/FETCH_SOURCES_COUNTS';
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
    activeUsers: 0,
    credibleArticles: 0,
    notCredibleArticles: 0,
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
    case FETCH_SOURCES_COUNTS:
      return {
        ...state,
        counts: action.statusText === 'success' ? {
          ...state.counts,
          pendingSources: action.pendingSources,
          credibleSources: action.credibleSources,
          notCredibleSources: action.notCredibleSources,
        } : state.counts,
        fetchCountsStatus: updateCrudStatus(action),
      };
    case FETCH_ARTICLES_COUNTS:
      return {
        ...state,
        counts: action.statusText === 'success' ? {
          ...state.counts,
          credibleArticles: action.credibleArticles,
          notCredibleArticles: action.notCredibleArticles,
        } : state.counts,
        fetchCountsStatus: updateCrudStatus(action),
      };
    case FETCH_USERS_COUNTS:
      return {
        ...state,
        counts: action.statusText === 'success' ? {
          ...state.counts,
          visitors: action.visitors,
          activeUsers: action.activeUsers,
        } : state.counts,
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


export const fetchTopInsights = (field, limit, cb) => {
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

      if (cb) cb();
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


export const fetchSentimentInsights = (cb) =>
  httpThunk(FETCH_SENTIMENT_TIME, async () => {
    try {
      const { data: insights, status } = await axios.get('/dashboard/sentiment');

      if (cb) cb();
      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchCategoriesInsights = (cb) =>
  httpThunk(FETCH_CATEGORIES_TIME, async () => {
    try {
      const { data: insights, status } = await axios.get('/dashboard/categories');

      if (cb) cb();
      return {
        statusText: 'success',
        insights,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchUsersCounts = (cb) =>
  httpThunk(FETCH_USERS_COUNTS, async () => {
    try {
      const { data: { visitors, activeUsers }, status } = await axios.get('/dashboard/usersCounts');

      if (cb) cb();
      return {
        statusText: 'success',
        visitors,
        activeUsers,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchSourcesCounts = (cb) =>
  httpThunk(FETCH_SOURCES_COUNTS, async () => {
    try {
      const { data: { pendingSources, credibleSources, notCredibleSources }, status } = await axios.get('/dashboard/sourcesCounts');

      if (cb) cb();
      return {
        statusText: 'success',
        pendingSources,
        credibleSources,
        notCredibleSources,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchArticlesCounts = (cb) =>
  httpThunk(FETCH_ARTICLES_COUNTS, async () => {
    try {
      const { data: { notCredibleArticles, credibleArticles }, status } = await axios.get('/dashboard/articlesCounts');

      if (cb) cb();
      return {
        statusText: 'success',
        notCredibleArticles,
        credibleArticles,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchSourcesSubmit = (cb) =>
  httpThunk(FETCH_SOURCES_SUBMIT, async () => {
    try {
      const { data: sourcesSubmit, status } = await axios.get('/dashboard/sourcesSubmit');

      if (cb) cb();
      return {
        statusText: 'success',
        sourcesSubmit,
        status,
      };
    } catch (e) {
      return e;
    }
  });
