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
  getUpdatedFields,
  PH_TIMEZONE,
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
          message: 'Source is already in the list of pending sources',
        });
      }

      if (matchedSource) {
        return next({
          status: 400,
          message: 'Source is already in the list of reliable sources',
        });
      }

      if (matchedFakeSource) {
        return next({
          status: 400,
          message: 'Source is already in the list of fake sources',
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
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        socialScore,
        countryRank,
        worldRank,
        brand,
        hasAboutPage,
        hasContactPage,
      };
      const { changes } = await r.table(tbl)
        .insert(pendingSourceInfo, { returnChanges: true })
        .run(conn);
      const insertedVal = changes[0].new_val;

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'create',
        sourceIds: [pendingSourceInfo.id],
        timestamp: r.expr(insertedVal.timestamp).inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      return res.json(insertedVal);
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
      const { changes } = await r.table(tbl)
        .get(sourceId)
        .update(source, { returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'update',
        sourceid: source.id,
        updated: getUpdatedFields(changes),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = '' } = req.body;

    try {
      const { changes } = await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .delete({ returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'delete',
        deleted: changes.map((change) => change.old_val),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:sourceId', async (req, res, next) => {
    const { sourceId = '' } = req.params;

    try {
      const { changes } = await r.table(tbl)
        .get(sourceId)
        .delete({ returnChanges: true })
        .run(conn);

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'delete',
        deleted: changes.map((change) => change.old_val),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.post('/verify', async (req, res, next) => {
    const {
      id,
      isReliable,
    } = req.body;

    try {
      const { changes } = await r.table(tbl)
        .get(id)
        .delete({ returnChanges: true })
        .run(conn);

      const pendingSource = changes[0].old_val;

      delete pendingSource.isReliable;

      const newSource = {
        ...pendingSource,
        verifiedByUserId: req.user.id,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
      };

      const table = isReliable ? 'sources' : 'fakeSources';
      const { changes: insertedVals } = await r.table(table)
        .insert(newSource, { returnChanges: true })
        .run(conn);
      const insertedVal = insertedVals[0].new_val;

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'verify',
        timestamp: insertedVal.timestamp,
        verified: {
          id: newSource.id,
          table,
        },
        table: tbl,
      }).run(conn);

      res.json(insertedVal);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
