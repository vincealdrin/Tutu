import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import {
  crudStatus,
  updateCrudStatus,
  httpThunk,
} from '../utils';
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  DEFAULT_CENTER,
} from '../constants';

export const FETCH_ARTICLES = 'mapArticles/FETCH_ARTICLES';
export const FETCH_FOCUSED_INFO = 'mapArticles/FETCH_FOCUSED_INFO';
export const FETCH_CLUSTER_INFO = 'mapArticles/FETCH_CLUSTER_INFO';
export const REMOVE_FOCUSED = 'mapArticles/REMOVE_FOCUSED';
export const UPDATE_REACTION = 'mapArticles/UPDATE_REACTION';
export const UPDATE_MAP_STATE = 'mapArticles/UPDATE_MAP_STATE';
export const UPDATE_FILTER_MAP_STATE = 'mapArticles/UPDATE_FILTER_MAP_STATE';

const initialState = {
  articles: [],
  clusters: [],
  totalCount: 0,
  articlesStatus: crudStatus,
  infoStatus: crudStatus,
  clusterStatus: crudStatus,
  reactionStatus: crudStatus,
  focusedInfo: {},
  focusedClusterInfo: [],
  focusedClusterArticles: [],
  focusedOn: '',
  filterMapState: {
    zoom: DEFAULT_ZOOM,
    center: {},
    bounds: {},
  },
  mapState: {
    zoom: DEFAULT_ZOOM,
    center: DEFAULT_CENTER,
  },
};
let source;
let focusedClusterSource;
let focusedInfoSource;

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_ARTICLES:
      return {
        ...state,
        articles: action.articles || state.articles,
        clusters: action.clusters || state.clusters,
        articlesStatus: updateCrudStatus(action),
      };
    case UPDATE_MAP_STATE:
      return {
        ...state,
        mapState: action.mapState,
      };
    case UPDATE_FILTER_MAP_STATE:
      return {
        ...state,
        filterMapState: action.filterMapState,
      };
    case FETCH_FOCUSED_INFO:
      return {
        ...state,
        focusedInfo: action.focusedInfo || state.focusedInfo,
        focusedOn: 'simple',
        infoStatus: updateCrudStatus(action),
        focusedClusterInfo: [],
      };
    case FETCH_CLUSTER_INFO:
      return {
        ...state,
        focusedClusterInfo: action.focusedClusterInfo || state.focusedClusterInfo,
        focusedOn: 'cluster',
        clusterStatus: updateCrudStatus(action),
        focusedClusterArticles: action.focusedClusterArticles || state.focusedClusterArticles,
        focusedInfo: {},
      };
    case REMOVE_FOCUSED:
      return {
        ...state,
        focusedOn: '',
        focusedInfo: {},
        focusedClusterInfo: [],
        focusedClusterArticles: [],
        infoStatus: crudStatus,
        clusterStatus: crudStatus,
        reactionStatus: crudStatus,
      };
    case UPDATE_REACTION:
      return {
        ...state,
        focusedInfo: state.focusedOn === 'simple' ? {
          ...state.focusedInfo,
          reactions: state.focusedInfo.reactions.map((reaction) => {
            if (reaction.group === action.reaction) {
              return {
                group: reaction.group,
                reduction: reaction.reduction + 1,
              };
            }
            return reaction;
          }),
        } : state.focusedInfo,
        focusedClusterInfo: state.focusedOn === 'cluster' ?
          state.focusedClusterInfo.map((article) => {
            if (article.url === action.url) {
              return {
                ...article,
                reactions: article.reactions.map((reaction) => {
                  if (reaction.group === action.reaction) {
                    return {
                      group: reaction.group,
                      reduction: reaction.reduction + 1,
                    };
                  }
                  return reaction;
                }),
              };
            }
            return article;
          }) : state.focusedClusterInfo,
        reactionStatus: updateCrudStatus(action),
      };
    default:
      return state;
  }
};

export const removeFocused = () => {
  if (focusedClusterSource) {
    focusedClusterSource.cancel();
  }

  if (focusedInfoSource) {
    focusedInfoSource.cancel();
  }

  return {
    type: REMOVE_FOCUSED,
  };
};

export const updateMapState = (center, zoom, bounds) => ({
  type: UPDATE_MAP_STATE,
  mapState: {
    center,
    zoom,
    bounds,
  },
});

export const updateFilterMapState = (center, zoom, bounds) => ({
  type: UPDATE_FILTER_MAP_STATE,
  filterMapState: {
    center,
    zoom,
    bounds,
  },
});

export const fetchArticles = (center, zoom, bounds) =>
  httpThunk(FETCH_ARTICLES, async (getState) => {
    if (source) {
      source.cancel();
    }
    source = axios.CancelToken.source();

    try {
      const {
        filters,
      } = getState();

      const {
        ne,
        nw,
        se,
        sw,
      } = bounds;
      const {
        data: articles,
        headers,
        status,
      } = await axios.get('/articles', {
        params: {
          neLng: ne.lng,
          neLat: ne.lat,
          nwLng: nw.lng,
          nwLat: nw.lat,
          seLng: se.lng,
          seLat: se.lat,
          swLng: sw.lng,
          swLat: sw.lat,
          keywords: filters.keywords.join(),
          categories: filters.categories.join(),
          sources: filters.sources.join(),
          people: filters.people.join(),
          orgs: filters.organizations.join(),
          sentiment: filters.sentiment !== 'none' ? filters.sentiment : '',
          popular: filters.popular.socials.length ? `${filters.popular.socials.join()}|${filters.popular.top}` : '',
          date: filters.date,
          timeWindow: `${31 - filters.timeWindow[0]},${31 - filters.timeWindow[1]}`,
          limit: filters.limit,
        },
        cancelToken: source.token,
      });

      const coords = flattenDeep(articles.map(({
        locations,
      }, index) =>
        locations.map(({
          lng,
          lat,
        }) => ({
          id: index,
          lng,
          lat,
        }))));
      const cluster = supercluster(coords, {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        radius: 42,
      });
      const clusters = cluster({
        center,
        zoom,
        bounds,
      });

      // dispatch(updateMapState(center, zoom, bounds));

      return {
        totalCount: parseInt(headers['x-total-count'], 10),
        clusters,
        articles,
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const fetchFocusedInfo = (article) => httpThunk(FETCH_FOCUSED_INFO, async (getState) => {
  try {
    if (focusedInfoSource) {
      focusedInfoSource.cancel();
    }
    focusedInfoSource = axios.CancelToken.source();

    const {
      filters: {
        categories,
      },
    } = getState();
    const {
      data: focusedInfo,
      status,
    } = await axios.get('/articles/info', {
      params: {
        id: article.id,
        catsFilterLength: categories.length,
      },
      cancelToken: focusedInfoSource.token,
    });

    return {
      focusedInfo: {
        ...focusedInfo,
        ...article,
      },
      status,
    };
  } catch (e) {
    return e;
  }
});

export const fetchFocusedClusterInfo = (articles, page = 0, limit = 10) =>
  httpThunk(FETCH_CLUSTER_INFO, async (getState) => {
    try {
      if (focusedClusterSource) {
        focusedClusterSource.cancel();
      }
      focusedClusterSource = axios.CancelToken.source();

      const {
        filters: {
          categories,
        },
        mapArticles: {
          focusedClusterArticles,
        },
      } = getState();
      const sliceArticles = (focusedClusterArticles.length ? focusedClusterArticles : articles)
        .slice(page * limit, (page + 1) * limit);


      const {
        data: focusedClusterInfo,
        status,
      } = await axios.get('/articles/clusterInfo', {
        params: {
          catsFilterLength: categories.length,
          ids: sliceArticles.map((article) => article.id).join(),
        },
        cancelToken: focusedClusterSource.token,
      });

      const payload = {
        focusedClusterInfo: await sliceArticles.map((article) => ({
          ...article,
          ...focusedClusterInfo.find((info) => info.id === article.id),
        })),
        status,
      };

      if (!focusedClusterArticles.length) {
        payload.focusedClusterArticles = articles;
      }

      return payload;
    } catch (e) {
      return e;
    }
  });

export const updateReaction = (url, reaction) => httpThunk(UPDATE_REACTION, async () => {
  try {
    const {
      status,
    } = await axios.put('/articles/reactions', {
      url,
      reaction,
    });

    return {
      url,
      reaction,
      status,
    };
  } catch (e) {
    return e;
  }
});
