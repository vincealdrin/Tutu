import axios, { Cancel } from 'axios';
import { beginTask, endTask } from 'redux-nprogress';

export const updateCrudStatus = (action) => ({
  pending: action.statusText === 'pending',
  success: action.statusText === 'success',
  error: action.statusText === 'error',
  cancelled: action.statusText === 'cancelled',
  status: action.status || null,
  errorMessage: action.errorMessage || '',
});

export const crudStatus = {
  pending: false,
  success: false,
  error: false,
  cancelled: false,
  status: null,
  errorMessage: '',
};

export const mapOptions = (opt) => ({
  key: opt,
  text: opt,
  value: opt,
});

export const articleId = (info) => `${info.title}-${info.source}-${info.publishDate}`;

export const httpThunk = (type, cb) => async (dispatch, getState) => {
  dispatch({ statusText: 'pending', type });
  dispatch(beginTask());
  const payload = await cb(getState, dispatch);

  if (payload instanceof Error) {
    const {
      response = {
        data: { message: '' },
        status: 500,
      },
    } = payload;
    dispatch({
      statusText: 'error',
      errorMessage: response.data.message,
      status: response.status,
      type,
    });
  } else if (payload instanceof Cancel) {
    dispatch({ statusText: 'cancelled', type });
  } else {
    dispatch({
      ...payload,
      statusText: 'success',
      type,
    });
  }
  dispatch(endTask());
};

export const getBarDataset = (dataset) => dataset.map(({
  label,
  data,
  color,
}) => ({
  label,
  data: [data],
  backgroundColor: `rgba(${color},0.2)`,
  borderColor: `rgba(${color},1)`,
  borderWidth: 1,
  barThickness: 1,
  hoverBackgroundColor: `rgba(${color},0.4)`,
  hoverBorderColor: `rgba(${color},1)`,
}));

export const getLineDataset = (dataset) => dataset.map(({
  label,
  data,
  color,
}) => ({
  label,
  data,
  fill: false,
  lineTension: 0.1,
  backgroundColor: `rgba(${color},0.4)`,
  borderColor: `rgba(${color},1)`,
  borderCapStyle: 'butt',
  borderDash: [],
  borderDashOffset: 0.0,
  borderJoinStyle: 'miter',
  pointBorderColor: `rgba(${color},1)`,
  pointBackgroundColor: '#fff',
  pointBorderWidth: 1,
  pointHoverRadius: 5,
  pointHoverBackgroundColor: `rgba(${color},1)`,
  pointHoverBorderColor: 'rgba(220,220,220,1)',
  pointHoverBorderWidth: 2,
  pointRadius: 1,
  pointHitRadius: 10,
}));

export const buildArticleQueryParams = ({
  filters,
  bounds,
  isCredible,
  isMap,
  limit,
  page,
  zoom,
}) => {
  const {
    ne,
    nw,
    se,
    sw,
  } = bounds;
  const params = {
    keywords: filters.keywords.join(),
    categories: filters.categories.join(),
    sources: filters.sources.join(),
    people: filters.people.join(),
    orgs: filters.organizations.join(),
    sentiment: filters.sentiment !== 'none' ? filters.sentiment : '',
    topPopular: filters.topPopular !== 'none' ? filters.topPopular : '',
    date: filters.date,
    timeWindow: `${31 - filters.timeWindow[0]},${31 - filters.timeWindow[1]}`,
    isCredible: isCredible ? 'yes' : 'no',
    limit: limit || filters.limit,
    page,
  };

  if (isMap) {
    params.zoom = zoom;
    params.neLng = ne.lng;
    params.neLat = ne.lat;
    params.nwLng = nw.lng;
    params.nwLat = nw.lat;
    params.seLng = se.lng;
    params.seLat = se.lat;
    params.swLng = sw.lng;
    params.swLat = sw.lat;
  }

  return params;
};

export const requestInsights = async (insightType, state, extraParams = {}) => {
  const {
    mapArticles: {
      articles,
      mapState: {
        bounds,
      },
      isCredible,
    },
    router: { location },
    filters,
  } = state;
  const isMap = !/grid/.test(location.pathname);

  let ids;

  if (isMap) {
    ids = articles.map((article) => article.id);
  }

  const params = !isMap ? {
    ...buildArticleQueryParams({
      filters,
      bounds,
      isCredible,
      extraParams,
    }),
    ...extraParams,
  } : { ...extraParams };

  const { data: insights, status } = await axios({
    method: isMap ? 'POST' : 'GET',
    url: `/insights/${insightType}`,
    data: { ids },
    params,
  });

  return {
    insights,
    status,
  };
};

export const getSentimentColor = (sentiment) => {
  if (sentiment === 'Positive') {
    return 'green';
  } else if (sentiment === 'Negative') {
    return 'red';
  } else if (sentiment === 'Neutral') {
    return 'grey';
  }
  return '';
};
