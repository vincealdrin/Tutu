const router = require('express').Router();
const r = require('rethinkdb');
const cheerio = require('cheerio');
const rp = require('request-promise');
const {
  cleanUrl,
  getAboutContactUrl,
  getSourceBrand,
  getAlexaRank,
  getSocialScore,
  putHttpUrl,
} = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'pendingSources';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      filter = '',
      search = '',
    } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    try {
      let query = r.table(tbl);

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const totalCount = await query.count().run(conn);
      const cursor = await query
        .orderBy(r.desc('timestamp'))
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
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
    const pendingSource = req.body;
    const url = cleanUrl(pendingSource.url);

    try {
      const uuid = await r.uuid(url).run(conn);
      const matchedPending = await r.table('pendingSources').get(uuid).run(conn);
      const matchedSource = await r.table('sources').get(uuid).run(conn);
      const matchedFakeSource = await r.table('fakeSources').get(uuid).run(conn);

      if (matchedPending) {
        return next({
          status: 400,
          message: 'Source is already in list of pending sources',
        });
      }

      if (matchedSource) {
        return next({
          status: 400,
          message: 'Source is already in list of reliable sources',
        });
      }

      if (matchedFakeSource) {
        return next({
          status: 400,
          message: 'Source is already in list of fake sources',
        });
      }

      const validUrl = putHttpUrl(url);
      const cheerioDoc = cheerio.load(await rp(validUrl));
      const brand = getSourceBrand(cheerioDoc) || validUrl;
      const socialScore = await getSocialScore(validUrl);
      const { countryRank, worldRank, sourceUrl } = await getAlexaRank(validUrl);
      const sourceCleanUrl = putHttpUrl(cleanUrl(sourceUrl));
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, sourceCleanUrl);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const pendingSourceInfo = {
        ...pendingSource,
        id: await r.uuid(sourceCleanUrl).run(conn),
        url: sourceCleanUrl,
        timestamp: new Date(),
        socialScore,
        countryRank,
        worldRank,
        brand,
        hasAboutPage,
        hasContactPage,
      };
      await r.table(tbl).insert(pendingSourceInfo).run(conn);

      return res.json(pendingSourceInfo);
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
    const { ids = '' } = req.body;

    try {
      await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .delete()
        .run(conn);

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

  router.post('/verify', async (req, res, next) => {
    const {
      id,
      isReliable,
      userId,
    } = req.body;

    try {
      const pendingSource = await r.table(tbl).get(id).run(conn);

      delete pendingSource.isReliable;
      delete pendingSource.isVerified;

      const newSource = {
        ...pendingSource,
        verifiedBy: userId,
        timestamp: new Date(),
      };
      await r.table(isReliable ? 'sources' : 'fakeSources').insert(newSource).run(conn);
      await r.table(tbl).get(id).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
