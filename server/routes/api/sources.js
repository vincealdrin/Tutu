const router = require('express').Router();
const r = require('rethinkdb');
const rp = require('request-promise');
const { getAboutContactUrl, getFaviconUrl, getSourceInfo } = require('../../utils');

const responseGroups = ['RelatedLinks', 'Categories', 'Rank', 'ContactInfo', 'RankByCountry',
  'UsageStats', 'Speed', 'Language', 'OwnedDomains', 'LinksInCount',
  'SiteData', 'AdultContent'];

module.exports = (conn, io) => {
  const tbl = 'sources';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const totalCount = await r.table(tbl).count().run(conn);
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const sources = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
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
    const dateAdded = new Date();
    const sourcesInfo = await Promise.all(sources.map(async (source) => {
      const url = /^https?:\/\//.test(source) ? source : `http://${source}`;
      const htmlDoc = await rp(url);

      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, url);
      const faviconUrl = getFaviconUrl(htmlDoc);
      const infoPromise = await getSourceInfo(source, responseGroups);
      const info = await infoPromise;
      delete info.contactInfo;

      return {
        ...info,
        faviconUrl,
        aboutUsUrl,
        contactUsUrl,
        dateAdded,
        id: await r.uuid(url).run(conn),
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
    const { isIdChanged } = req.query;
    const source = req.body;

    if (isIdChanged) {
      source.id = await r.uuid(source.url).run(conn);
    }

    try {
      await r.table(tbl).get(sourceId).update(source).run(conn);

      res.json(source);
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
