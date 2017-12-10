import axios from 'axios';
import supercluster from 'points-cluster';
import flattenDeep from 'lodash/flattenDeep';
import { crudStatus, updateCrudStatus, httpThunk } from '../utils';
import { DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from '../constants';

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
  focusedOn: '',
  filterMapState: {
    zoom: DEFAULT_ZOOM,
    center: {},
    bounds: {},
  },
  mapState: {
    zoom: DEFAULT_ZOOM,
    center: {
      lat: 12.238496434320027,
      lng: 122.11708496093752,
    },
    bounds: {},
  },
};
let source;

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
        focusedInfo: {},
        isFocused: true,
      };
    case REMOVE_FOCUSED:
      return {
        ...state,
        focusedOn: '',
        focusedInfo: {},
        focusedClusterInfo: [],
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

export const removeFocused = () => ({
  type: REMOVE_FOCUSED,
});

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
      const { filters } = getState();

      const {
        ne, nw,
        se, sw,
      } = bounds;
      const { data: articles, headers, status } = await axios.get('/articles', {
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
          timeWindow: `${31 - filters.timeWindow[0]},${31 - filters.timeWindow[1]}`,
          limit: filters.limit,
        },
        cancelToken: source.token,
      });

      const coords = flattenDeep(articles.map(({ locations }, index) =>
        locations.map(({ lng, lat }) => ({
          id: index,
          lng,
          lat,
        }))));
      const cluster = supercluster(coords, {
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        radius: 40,
      });
      const clusters = cluster({ center, zoom, bounds });

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
    const { filters: { categories } } = getState();
    const { data: focusedInfo, status } = await axios.get('/articles/info', {
      params: {
        url: article.url,
        catsFilter: categories.length,
      },
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

export const fetchFocusedClusterInfo = (articles) =>
  httpThunk(FETCH_CLUSTER_INFO, async (getState) => {
    try {
      const { filters: { categories } } = getState();
      const { data: focusedClusterInfo, status } = await axios.get('/articles/clusterInfo', {
        params: {
          urls: articles.map((article) => article.url).join(),
          catsFilter: categories.length,
        },
      });

      return {
        focusedClusterInfo: articles.map((article, i) => ({
          ...article,
          ...focusedClusterInfo[i],
        })),
        status,
      };
    } catch (e) {
      return e;
    }
  });

export const updateReaction = (url, reaction) => httpThunk(UPDATE_REACTION, async () => {
  try {
    const { status } = await axios.put('/articles/reactions', {
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
