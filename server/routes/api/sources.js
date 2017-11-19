const router = require('express').Router();
const r = require('rethinkdb');
const awis = require('awis');
const rp = require('request-promise');
const cheerio = require('cheerio');

const awisClient = awis({
  key: process.env.AMAZON_ACCESS_KEY,
  secret: process.env.AMAZON_SECRET_KEY,
});

const responseGroups = ['RelatedLinks', 'Categories', 'Rank', 'ContactInfo', 'RankByCountry',
  'UsageStats', 'Speed', 'Language', 'OwnedDomains', 'LinksInCount',
  'SiteData', 'AdultContent'];
const getSourceInfo = (url) => new Promise((resolve, reject) => {
  awisClient({
    Action: 'UrlInfo',
    Url: url,
    ResponseGroup: responseGroups.join(),
  }, (err, info) => {
    if (err) reject(err);
    resolve(info);
  });
});

const getAboutContactUrl = async (url) => {
  try {
    const htmlDoc = await rp(url);
    const $ = cheerio.load(htmlDoc);

    let aboutUsUrl = $('a:contains("About")')
      .filter(function() {
        return (/about ?(us)?/i).test($(this).text());
      })
      .attr('href') || '';

    if (aboutUsUrl[0] === '/') {
      aboutUsUrl = url + aboutUsUrl;
    }

    if (aboutUsUrl.substring(0, 2) === '//') {
      aboutUsUrl = `http:${aboutUsUrl}`;
    }

    if (aboutUsUrl && !/^https?:\/\//.test(aboutUsUrl)) {
      aboutUsUrl = `http://${aboutUsUrl}`;
    }

    let contactUsUrl = $('a:contains("Contact")')
      .filter(function() {
        return (/contact ?(us)?/i).test($(this).text());
      })
      .attr('href') || '';

    if (contactUsUrl[0] === '/') {
      contactUsUrl = url + contactUsUrl;
    }

    if (contactUsUrl.substring(0, 2) === '//') {
      contactUsUrl = `http:${contactUsUrl}`;
    }

    if (contactUsUrl && !/^https?:\/\//.test(contactUsUrl)) {
      contactUsUrl = `http://${contactUsUrl}`;
    }

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

module.exports = (conn, io) => {
  const tbl = 'sources';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;

    try {
      const source = await r.table(tbl).get(sourceId).run(conn);

      return res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const sources = req.body;
    const sourcesInfo = await Promise.all(sources.map(async (source) => {
      const url = /^https?:\/\//.test(source) ? source : `http://${source}`;

      const { aboutUsUrl, contactUsUrl } = await getAboutContactUrl(url);
      const infoPromise = await getSourceInfo(source);
      const info = await infoPromise;
      delete info.contactInfo;

      return {
        ...info,
        aboutUsUrl,
        contactUsUrl,
        id: r.uuid(url),
      };
    }));

    try {
      await r.table(tbl).insert(sourcesInfo).run(conn);
      return res.json(sourcesInfo);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;
    const source = req.body;

    try {
      await r.table(tbl).get(sourceId).update(source).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = [] } = req.body;

    try {
      await r.table(tbl).getAll(r.args(ids)).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:sourceId', async (req, res, next) => {
    const { sourceId = '' } = req.params;

    try {
      await r.table(tbl).getAll(sourceId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
