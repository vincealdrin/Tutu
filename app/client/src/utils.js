import axios, { Cancel } from 'axios';
import flatten from 'lodash/flatten';
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
  isCredible,
  isMap,
  limit,
  page,
}) => {
  const params = {
    keywords: filters.keywords.join('.-'),
    categories: filters.categories.join(),
    sources: filters.sources.join(),
    authors: filters.authors.join(),
    sentiment: filters.sentiment !== 'none' ? filters.sentiment : '',
    topPopular: filters.topPopular !== 'none' ? filters.topPopular : '',
    date: filters.date,
    timeWindow: `${31 - filters.timeWindow[0]},${31 - filters.timeWindow[1]}`,
    isCredible: isCredible ? 'yes' : 'no',
    limit: limit || filters.limit,
    isMap: isMap ? 'yes' : 'no',
    page,
  };

  return params;
};

export const requestInsights = async (insightType, state, extraParams = {}) => {
  const {
    mapArticles: {
      articles,
      clusters,
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
    const indexes = flatten(clusters.map(({ points }) => points.map((point) => point.id)));
    ids = articles.filter((_, i) => indexes.includes(i)).map((article) => article.id);
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

export const getLineChartOptions = (isDatalabelShown) => ({
  plugins: {
    datalabels: isDatalabelShown ? {
      backgroundColor(context) {
        return context.dataset.backgroundColor;
      },
      borderRadius: 4,
      color: 'black',
      font: {
        weight: 'bold',
      },
      formatter: Math.round,
    } : false,
  },
});

export const getPieChartOptions = (isDatalabelShown) => ({
  plugins: {
    datalabels: isDatalabelShown ? {
      color: 'black',
      // font: {
      //   weight: 'bold',
      // },
      anchor: 'end',
      align: 'start',
      formatter: Math.round,
    } : false,
  },
});

export const getBarChartOptions = (isDatalabelShown) => ({
  plugins: {
    datalabels: isDatalabelShown ? {
      color: 'black',
      // font: {
      //   weight: 'bold',
      // },
      anchor: 'end',
      align: 'left',
      formatter: Math.round,
    } : false,
  },
});

