const cheerio = require('cheerio');
const awis = require('awis');
const _ = require('lodash');
const r = require('rethinkdb');
const rp = require('request-promise');

const awisClient = awis({
  key: process.env.AMAZON_ACCESS_KEY,
  secret: process.env.AMAZON_SECRET_KEY,
});

const PH_TIMEZONE = '+08:00';
const WEEK_IN_SEC = 604800;

module.exports.PH_TIMEZONE = PH_TIMEZONE;
module.exports.WEEK_IN_SEC = WEEK_IN_SEC;

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

module.exports.getTitle = (htmlDoc) => {
  const $ = cheerio.load(htmlDoc);

  return $('title').text();
};

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

module.exports.getSourceBrand = (url, title) => {
  const titleArr = title.split(/-|\|/);
  const foundTitle = titleArr.find((word) => new RegExp(_.trim(word), 'i').test(url));

  if (foundTitle) {
    return foundTitle;
  }
  return title;
};

const cleanUrl = (dirtyUrl = '', baseUrl) => {
  let url = dirtyUrl;

  if (dirtyUrl.substring(0, 2) === '//') {
    url = `http:${dirtyUrl}`;
  } else if (dirtyUrl[0] === '/') {
    url = baseUrl + dirtyUrl;
  } else if (dirtyUrl && !/^https?:\/\//.test(dirtyUrl)) {
    url = `http://${dirtyUrl}`;
  }

  return url;
};

module.exports.getFaviconUrl = (htmlDoc, baseUrl) => {
  const $ = cheerio.load(htmlDoc);
  const url = $('link[rel="shortcut icon"]').attr('href');

  return cleanUrl(url, baseUrl);
};

module.exports.getAboutContactUrl = (htmlDoc, baseUrl) => {
  try {
    const $ = cheerio.load(htmlDoc);

    let aboutUsUrl = cleanUrl($('a:contains("About")')
      .filter(function() {
        return (/about ?(us)?/i).test($(this).text());
      })
      .attr('href'), baseUrl);

    const contactUsUrl = cleanUrl($('a:contains("Contact")')
      .filter(function() {
        return (/contact ?(us)?/i).test($(this).text());
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

const mapLocation = (loc) => {
  const coords = loc('location')('position').toGeojson()('coordinates');
  return {
    lng: coords.nth(0),
    lat: coords.nth(1),
  };
};

const getCategoriesField = (article, max = 2) => article('categories')
  .orderBy(r.desc((category) => category('score')))
  .slice(0, max === 0 ? 2 : max)
  .getField('label');

module.exports.getCategoriesField = getCategoriesField;

module.exports.getRelatedArticles = (article) =>
  r.table('articles').filter((doc) =>
    article('publishDate').date()
      .during(
        r.time(doc('publishDate').year(), doc('publishDate').month(), doc('publishDate').day(), PH_TIMEZONE).sub(WEEK_IN_SEC),
        r.time(doc('publishDate').year(), doc('publishDate').month(), doc('publishDate').day(), PH_TIMEZONE).add(WEEK_IN_SEC),
        { rightBound: 'closed' }
      )
      .and(article('categories').contains((label) => getCategoriesField(doc).contains(label)))
      .or(doc('keywords').contains((keyword) => article('topics')('common').coerceTo('string').match(keyword)))
      .or(doc('people').contains((person) => article('people').coerceTo('string').match(person)))
      .or(doc('organizations').contains((org) => article('organizations').coerceTo('string').match(org)))
      .and(doc('id').ne(article('id'))))
    .orderBy(r.desc('timestamp'))
    .slice(0, 20)
    .pluck('title', 'url');

const getSentiment = (sentiment) => r.branch(
  sentiment('compound').ge(0.5), 'Positive',
  sentiment('compound').le(-0.5), 'Negative',
  'Neutral',
);

module.exports.mapArticleInfo = (catsFilterLength) => (article) => ({
  id: article('id'),
  url: article('url'),
  title: article('title'),
  authors: article('authors'),
  keywords: article('topics')('common'),
  people: article('people'),
  organizations: article('organizations'),
  publishDate: article('publishDate'),
  sentiment: getSentiment(article('sentiment')),
  summary: article('summary'),
  categories: getCategoriesField(article, catsFilterLength),
  reactions: article('reactions').group('reaction').count().ungroup(),
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

module.exports.mapSideArticle = (join) => {
  const article = {
    id: join('left')('id'),
    url: join('left')('url'),
    title: join('left')('title'),
    publishDate: join('left')('publishDate'),
    summary: join('left')('summary'),
    topImageUrl: join('left')('topImageUrl'),
    source: join('right')('brand'),
    sourceUrl: join('right')('url'),
  };

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
