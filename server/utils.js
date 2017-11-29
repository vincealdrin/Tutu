const cheerio = require('cheerio');
const awis = require('awis');
const r = require('rethinkdb');

const awisClient = awis({
  key: process.env.AMAZON_ACCESS_KEY,
  secret: process.env.AMAZON_SECRET_KEY,
});

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
    console.error(e);
    return { error: 'Source Error' };
  }
};

module.exports.mapArticle = (bounds) => (join) => {
  const article = {
    url: join('left')('url'),
    title: join('left')('title'),
    authors: join('left')('authors'),
    keywords: join('left')('keywords'),
    publishDate: join('left')('publishDate'),
    sentiment: join('left')('sentiment'),
    summary: join('left')('summary'),
    summary2: join('left')('summary2'),
    topImageUrl: join('left')('topImageUrl'),
    timestamp: join('left')('timestamp'),
    categories: join('left')('categories').filter((category) => category('score').gt(0)),
    source: join('right')('contentData')('siteData')('title'),
    sourceUrl: join('right')('contentData')('dataUrl'),
    sourceFaviconUrl: join('right')('faviconUrl'),
  };

  if (bounds) {
    article.locations = join('left')('locations')
      .filter((loc) => bounds.intersects(loc('location')('position')))
      .map((loc) => loc('location')('position').toGeojson()('coordinates'));
  } else {
    article.locations = join('left')('locations')
      .map((loc) => loc('location')('position').toGeojson()('coordinates'));
  }

  return article;
};

module.exports.mapFeedArticle = (join) => {
  const article = {
    url: join('left')('new_val')('url'),
    title: join('left')('new_val')('title'),
    authors: join('left')('new_val')('authors'),
    keywords: join('left')('new_val')('keywords'),
    publishDate: join('left')('new_val')('publishDate'),
    sentiment: join('left')('new_val')('sentiment'),
    summary: join('left')('new_val')('summary'),
    summary2: join('left')('new_val')('summary2'),
    topImageUrl: join('left')('new_val')('topImageUrl'),
    timestamp: join('left')('new_val')('timestamp'),
    categories: join('left')('new_val')('categories').filter((category) => category('score').gt(0)),
    locations: join('left')('new_val')('locations').map((loc) => loc('location')('position').toGeojson()('coordinates')),
    source: join('right')('contentData')('siteData')('title'),
    sourceUrl: join('right')('contentData')('dataUrl'),
    sourceFaviconUrl: join('right')('faviconUrl'),
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
    runtime: join('left')('new_val')('runtime').default(0),
    articleUrl: join('left')('new_val')('articleUrl').default(''),
    sleepTime: join('left')('new_val')('sleepTime').default(0),
    timestamp: join('left')('new_val')('timestamp'),
    articlesCount: join('left')('new_val')('articlesCount').default(0),
    articlesCrawledCount: join('left')('new_val')('articlesCrawledCount').default(0),
    error: join('left')('error').default(''),
    sourceUrl: join('right')('contentData')('dataUrl'),
    sourceTitle: join('right')('contentData')('siteData')('title'),
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
  runtime: join('left')('runtime').default(0),
  articleUrl: join('left')('articleUrl').default(''),
  sleepTime: join('left')('sleepTime').default(0),
  timestamp: join('left')('timestamp'),
  articlesCount: join('left')('articlesCount').default(0),
  articlesCrawledCount: join('left')('articlesCrawledCount').default(0),
  error: join('left')('error').default(''),
  sourceUrl: join('right')('contentData')('dataUrl'),
  sourceTitle: join('right')('contentData')('siteData')('title'),
  article: r.table('articles')
    .get(join('left')('articleId'))
    .pluck('authors', 'title', 'summary', 'url', 'publishDate')
    .merge((article) => ({ summary: article('summary').nth(0) }))
    .default({}),
});
