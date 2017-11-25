const cheerio = require('cheerio');
const awis = require('awis');

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
