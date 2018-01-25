const whois = require('whois-json');
const awis = require('awis');
const _ = require('lodash');
const { parseString } = require('xml2js');
const r = require('rethinkdb');
const rp = require('request-promise');
const randomUserAgent = require('random-useragent');
const cloudscraper = require('cloudscraper');

const awisClient = awis({
  key: process.env.AMAZON_ACCESS_KEY,
  secret: process.env.AMAZON_SECRET_KEY,
});

const PH_TIMEZONE = '+08:00';
const WEEK_IN_SEC = 604800;

module.exports.PH_TIMEZONE = PH_TIMEZONE;
module.exports.WEEK_IN_SEC = WEEK_IN_SEC;

module.exports.getUpdatedFields = (changes) =>
  changes.map((change) => {
    const newVal = {};
    const oldVal = {};

    _.each(change.new_val, (val, key) => {
      if (val !== change.old_val[key]) {
        newVal[key] = val;
        oldVal[key] = change.old_val[key];
      }
    });

    return {
      newVal,
      oldVal,
    };
  });

const parseXML = (xmlString) => new Promise((resolve, reject) => {
  parseString(xmlString, (err, res) => {
    if (err) {
      reject(err);
    } else {
      resolve(res);
    }
  });
});
module.exports.getAlexaRank = async (url) => {
  const xmlString = await rp(`http://data.alexa.com/data?cli=10&url=${url}`);
  const res = await parseXML(xmlString);

  const info = {
    sourceUrl: res.ALEXA.SD ? res.ALEXA.SD[0].POPULARITY[0].$.URL : url,
    worldRank: res.ALEXA.SD && res.ALEXA.SD[0].POPULARITY
      ? parseInt(res.ALEXA.SD[0].POPULARITY[0].$.TEXT)
      : 0,
    countryRank: res.ALEXA.SD && res.ALEXA.SD[0].COUNTRY
      ? parseInt(res.ALEXA.SD[0].COUNTRY[0].$.RANK)
      : 0,
  };

  return info;
};

module.exports.getDomainCreationDate = (url) => new Promise((resolve, reject) => {
  const validUrl = url
    .replace(/https?:\/\//, '')
    .replace(/\/$/, '')
    .replace('www.', '');

  whois(validUrl, (err, data) => {
    if (err) {
      reject(err);
    } else {
      resolve(data.creationDate);
    }
  });
});

module.exports.getSocialScore = async (url) => {
  const reddit = await rp(`https://www.reddit.com/api/info.json?url=${url}`, {
    json: true,
  });
  const infos = reddit.data.children;
  const subSharedCount = infos.length;
  const totalScore = infos.reduce((prev, next) => (prev + next.data.score), 0);
  const totalNumComments = infos.reduce((prev, next) => (prev + next.data.num_comments), 0);
  const redScore = totalScore + totalNumComments + subSharedCount;

  const sharedCount = await rp(`https://api.sharedcount.com/v1.0/?url=${url}&apikey=${process.env.SHARED_COUNT_API_KEY}`, {
    json: true,
  });

  const suScore = sharedCount.StumbleUpon || 0;
  const pinScore = sharedCount.Pinterest || 0;
  const liScore = sharedCount.LinkedIn || 0;
  const fbScore = (sharedCount.Facebook && sharedCount.Facebook.total_count) || 0;

  return redScore + suScore + liScore + fbScore + pinScore;
};

module.exports.getTitle = ($) => $('title').text() || '';

module.exports.getSourceInfo = (url, responseGroups) => new Promise((resolve, reject) => {
  awisClient({
    Action: 'UrlInfo',
    Url: url,
    ResponseGroup: responseGroups.join(),
  }, (err, info) => {
    if (err) reject(err);
    resolve(info);
  });
});

module.exports.getDomainOnly = (url) => url
  .replace(/https?:\/\//, '')
  .split('.')
  .slice(0, -1)
  .join('.')
  .toUpperCase();

module.exports.getSourceBrand = ($) => {
  const brand = $('meta[property="og:site_name"]').attr('content');

  return _.trim(brand);
};

const cleanUrl = (dirtyUrl = '', baseUrl = '') => {
  let url = dirtyUrl;

  if (dirtyUrl.substring(0, 2) === '//') {
    url = `http:${dirtyUrl}`;
  } else if (dirtyUrl[0] === '/') {
    url = baseUrl + dirtyUrl;
  }

  url = url
    .replace('www.', '')
    .replace(/^(https:\/\/)/, 'http://')
    .replace(/\/$/, '');

  if (url && !/^http:\/\//.test(url)) {
    url = `http://${url}`;
  }

  return url;
};

module.exports.cleanUrl = cleanUrl;

module.exports.removeUrlPath = (url) => `http://${cleanUrl(url)
  .replace(/^(https?:\/\/)/, '')
  .replace(/(?=\/).+/, '')}`;

module.exports.getFaviconUrl = ($, baseUrl) => {
  const url = $('link[rel="shortcut icon"]').attr('href');

  return cleanUrl(url, baseUrl);
};

module.exports.getAboutContactUrl = ($, baseUrl) => {
  try {
    let aboutUsUrl = cleanUrl($('a:contains("About")')
      .filter(function() {
        return (/about(-|\s)?(us)?/i).test($(this).text());
      })
      .attr('href'), baseUrl);

    const contactUsUrl = cleanUrl($('a:contains("Contact")')
      .filter(function() {
        return (/contact(-|\s)?(us)?/i).test($(this).text());
      })
      .attr('href'), baseUrl);

    if (!aboutUsUrl) {
      $('a').each(function() {
        if ((/about-? ?us?/i).test($(this).attr('href'))) {
          aboutUsUrl = $(this).attr('href');
          return false;
        }
      });
    }

    if (!contactUsUrl) {
      $('a').each(function() {
        if ((/about-? ?us?/i).test($(this).attr('href'))) {
          aboutUsUrl = $(this).attr('href');
          return false;
        }
      });
    }

    return { aboutUsUrl, contactUsUrl };
  } catch (e) {
    return { error: 'Source Error' };
  }
};

module.exports.cloudScrape = (url) => new Promise((resolve, reject) => {
  const proxies = [
    process.env.PROXY_IP,
    process.env.PROXY_IP2,
  ];
  const proxy = `http://${proxies[_.random(0, 1)]}`;

  cloudscraper.request({
    method: 'GET',
    headers: {
      'User-Agent': randomUserAgent.getRandom(),
    },
    proxy,
    url,
  }, (error, response, body) => {
    if (error) {
      reject(error);
    } else {
      resolve(body);
    }
  });
});

const mapLocation = (loc) => {
  const coords = loc('location')('position').toGeojson()('coordinates');
  // const address = r.branch(
  //   loc('found').eq('location'),
  //   loc('location')('formattedAddress'),
  //   loc('province')('name').add(', Philippines')
  // );

  return {
    // address,
    lng: coords.nth(0),
    lat: coords.nth(1),
  };
};

const getCategoriesField = (article, max = 2) => article('categories')
  .slice(0, max === 0 ? 2 : max)
  .getField('label');

module.exports.getCategoriesField = getCategoriesField;

const getSentiment = (sentiment) => r.branch(
  sentiment('compound').ge(0.5), 'Positive',
  sentiment('compound').le(-0.5), 'Negative',
  'Neutral',
);

module.exports.mergeRelatedArticles = (isCredible) => (article) => {
  const query = r.table('articles')
    .getAll(r.args(article('relatedArticles')))
    .eqJoin('sourceId', r.table('sources'));

  const relatedArticles = {
    articles: query
      .filter((join) => join('right')('isReliable').eq(isCredible))
      .limit(5)
      .map((join) => ({
        title: join('left')('title'),
        url: join('left')('url'),
        publishDate: join('left')('publishDate'),
        source: join('right')('brand'),
        sourceUrl: join('right')('url'),
      }))
      .coerceTo('array'),
  };

  if (!isCredible) {
    relatedArticles.credibleArticles = query
      .filter((join) => join('right')('isReliable').eq(true))
      .limit(5)
      .map((join) => ({
        title: join('left')('title'),
        url: join('left')('url'),
        publishDate: join('left')('publishDate'),
        source: join('right')('brand'),
        sourceUrl: join('right')('url'),
      }))
      .coerceTo('array');
  }

  return { relatedArticles };
};

module.exports.mapGridArticle = (join) => ({
  id: join('left')('id'),
  url: join('left')('url'),
  title: join('left')('title'),
  authors: join('left')('authors'),
  summary: join('left')('summary').nth(0),
  publishDate: join('left')('publishDate'),
  topImageUrl: join('left')('topImageUrl'),
  source: join('right')('brand'),
  sourceUrl: join('right')('url'),
});

module.exports.mapArticleInfo = (catsFilterLength = 2) => (article) => ({
  id: article('id'),
  url: article('url'),
  authors: article('authors'),
  keywords: article('keywords'),
  people: article('people'),
  organizations: article('organizations'),
  publishDate: article('publishDate'),
  sentiment: getSentiment(article('sentiment')),
  summary: article('summary').nth(0),
  relatedArticles: article('relatedArticles'),
  // locations: article('locations').map((location) => r.branch(
  //   location('found').eq('location'),
  //   location('location')('formattedAddress'),
  //   location('province')('name').add(', Philippines')
  // )),
  categories: getCategoriesField(article, catsFilterLength),
  reactions: article('reactions')
    .group('reaction')
    .count()
    .ungroup()
    .map((group) => [group('group'), group('reduction')])
    .coerceTo('object')
  ,
});

module.exports.mapArticle = (bounds) => (join) => {
  const article = {
    id: join('left')('id'),
    title: join('left')('title'),
    publishDate: join('left')('publishDate'),
    topImageUrl: join('left')('topImageUrl'),
    source: join('right')('brand'),
    sourceUrl: join('right')('url'),
  };

  if (bounds) {
    article.locations = join('left')('locations')
      .filter((loc) => bounds.intersects(loc('location')('position')))
      .map(mapLocation);
  } else {
    article.locations = join('left')('locations').map(mapLocation);
  }

  return article;
};

module.exports.mapFeedArticle = (join) => {
  const article = {
    id: join('left')('new_val')('id'),
    url: join('left')('new_val')('url'),
    title: join('left')('new_val')('title'),
    publishDate: join('left')('new_val')('publishDate'),
    summary: join('left')('new_val')('summary'),
    topImageUrl: join('left')('new_val')('topImageUrl'),
    source: join('right')('brand'),
    sourceUrl: join('right')('url'),
    isCredible: join('right')('isReliable'),
  };

  return {
    type: join('left')('type'),
    article,
  };
};

module.exports.mapFeedLog = (join) => ({
  type: join('left')('type'),
  log: {
    status: join('left')('new_val')('status'),
    type: join('left')('new_val')('type'),
    runTime: join('left')('new_val')('runTime').default(0),
    articleUrl: join('left')('new_val')('articleUrl').default(''),
    timestamp: join('left')('new_val')('timestamp'),
    articlesCount: join('left')('new_val')('articlesCount').default(0),
    articlesCrawledCount: join('left')('new_val')('articlesCrawledCount').default(0),
    proxy: join('left')('new_val')('proxy').default(''),
    userAgent: join('left')('new_val')('userAgent').default(''),
    errorMessage: join('left')('new_val')('errorMessage').default(''),
    sourceUrl: join('right')('url'),
    sourceBrand: join('right')('brand'),
    article: r.table('articles')
      .get(join('left')('new_val')('articleId'))
      .pluck('authors', 'title', 'summary', 'url', 'publishDate')
      .merge((article) => ({ summary: article('summary').nth(0) }))
      .default({}),
  },
});

module.exports.mapLog = (join) => ({
  status: join('left')('status'),
  type: join('left')('type'),
  runTime: join('left')('runTime').default(0),
  articleUrl: join('left')('articleUrl').default(''),
  timestamp: join('left')('timestamp'),
  articlesCount: join('left')('articlesCount').default(0),
  articlesCrawledCount: join('left')('articlesCrawledCount').default(0),
  proxy: join('left')('proxy').default(''),
  userAgent: join('left')('userAgent').default(''),
  errorMessage: join('left')('errorMessage').default(''),
  sourceUrl: join('right')('url'),
  sourceBrand: join('right')('brand'),
  article: r.table('articles')
    .get(join('left')('articleId'))
    .pluck('authors', 'title', 'summary', 'url', 'publishDate')
    .merge((article) => ({ summary: article('summary').nth(0) }))
    .default({}),
});

module.exports.buildArticlesQuery = async (params, bounds) => {
  const {
    keywords = '',
    categories = '',
    orgs = '',
    people = '',
    sources = '',
    timeWindow = '7,0',
    date = new Date().toLocaleString(),
    topPopular = '',
    sentiment = '',
    isCredible = 'yes',
    zoom = '8',
  } = params;
  const catsArr = categories.split(',');
  let query = await r.table('articles');
  const parsedZoom = parseInt(zoom);

  // if (bounds && parsedZoom !== 6) {
  //   query = query.getIntersecting(bounds, {
  //     index: 'positions',
  //   }).distinct();
  // }

  const [start, end] = timeWindow.split(',');
  const selectedDate = new Date(JSON.parse(date));
  const parsedStart = parseInt(start);
  const parsedEnd = parseInt(end);

  if (!parsedStart && !parsedEnd) {
    query = query.filter((article) =>
      article('publishDate').date()
        .eq(r.expr(selectedDate).inTimezone(PH_TIMEZONE).date()));
  } else {
    const startDate = new Date(selectedDate.getTime());
    startDate.setDate(selectedDate.getDate() - parsedStart);
    const endDate = new Date(selectedDate.getTime());
    endDate.setDate(selectedDate.getDate() - parsedEnd);

    query = query.filter(r.row('publishDate').date().during(
      r.expr(startDate).inTimezone(PH_TIMEZONE).date(),
      r.expr(endDate).inTimezone(PH_TIMEZONE).date(),
      { rightBound: 'closed' }
    ));
  }

  if (keywords) {
    query = query.filter((article) => article('body').match(`(?i)${keywords.replace(',', '|')}`));
  }

  if (categories) {
    query = query.filter((article) => getCategoriesField(article)
      .contains((category) => r.expr(catsArr).contains(category)));
  }

  if (orgs) {
    query = query.filter((article) => r.expr(orgs.split(','))
      .contains((org) => article('organizations').contains(org)));
  }

  if (people) {
    query = query.filter((article) => r.expr(people.split(','))
      .contains((person) => article('people').contains(person)));
  }

  if (sentiment) {
    if (sentiment === 'positive') {
      query = query.filter((article) => article('sentiment')('compound').ge(0.5));
    } else if (sentiment === 'negative') {
      query = query.filter((article) => article('sentiment')('compound').le(-0.5));
    } else {
      query = query.filter((article) => article('sentiment')('compound').gt(0.5)
        .and(article('sentiment')('compound').lt(-0.5)));
    }
  }

  if (topPopular) {
    const parsedTopPop = parseInt(topPopular);

    query = query.orderBy(r.desc(r.row('popularity')('totalScore'))).limit(parsedTopPop);
  }

  query = query.eqJoin('sourceId', r.table('sources'));

  if (sources) {
    query = query.filter((article) => article('right')('brand')
      .match(`(?i)${sources.replace(',', '|')}`));
  }

  query = query.filter(r.row('right')('isReliable').eq(isCredible === 'yes'));

  return query;
};

module.exports.mapCategoriesInsight = (article) => {
  const categories = getCategoriesField(article);
  return {
    Economy: r.branch(categories.contains('Economy'), 1, 0),
    Lifestyle: r.branch(categories.contains('Lifestyle'), 1, 0),
    Sports: r.branch(categories.contains('Sports'), 1, 0),
    Politics: r.branch(categories.contains('Politics'), 1, 0),
    Health: r.branch(categories.contains('Health'), 1, 0),
    Crime: r.branch(categories.contains('Crime'), 1, 0),
    Weather: r.branch(categories.contains('Weather'), 1, 0),
    Culture: r.branch(categories.contains('Culture'), 1, 0),
    Environment: r.branch(categories.contains('Environment'), 1, 0),
    'Business & Finance': r.branch(categories.contains('Business & Finance'), 1, 0),
    'Disaster & Accident': r.branch(categories.contains('Disaster & Accident'), 1, 0),
    'Entertainment & Arts': r.branch(categories.contains('Entertainment & Arts'), 1, 0),
    'Law & Government': r.branch(categories.contains('Law & Government'), 1, 0),
    'Science & Technology': r.branch(categories.contains('Science & Technology'), 1, 0),
  };
};

module.exports.reduceCategoriesInsight = (left, right) => ({
  Economy: left('Economy').add(right('Economy')),
  Lifestyle: left('Lifestyle').add(right('Lifestyle')),
  Sports: left('Sports').add(right('Sports')),
  Politics: left('Politics').add(right('Politics')),
  Health: left('Health').add(right('Health')),
  Crime: left('Crime').add(right('Crime')),
  Weather: left('Weather').add(right('Weather')),
  Culture: left('Culture').add(right('Culture')),
  Environment: left('Environment').add(right('Environment')),
  'Business & Finance': left('Business & Finance').add(right('Business & Finance')),
  'Disaster & Accident': left('Disaster & Accident').add(right('Disaster & Accident')),
  'Entertainment & Arts': left('Entertainment & Arts').add(right('Entertainment & Arts')),
  'Law & Government': left('Law & Government').add(right('Law & Government')),
  'Science & Technology': left('Science & Technology').add(right('Science & Technology')),
});


module.exports.mapSentimentInsight = (article) => r.branch(
  article('sentiment')('compound').ge(0.5),
  { pos: 1, neu: 0, neg: 0 },
  article('sentiment')('compound').le(-0.5),
  { pos: 0, neu: 0, neg: 1 },
  { pos: 0, neu: 1, neg: 0 }
);
module.exports.reduceSentimentInsight = (left, right) => ({
  pos: left('pos').add(right('pos')),
  neu: left('neu').add(right('neu')),
  neg: left('neg').add(right('neg')),
});
