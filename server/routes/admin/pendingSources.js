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
  getUpdatedFields,
  PH_TIMEZONE,
  getTitle,
  getFaviconUrl,
  getDomainOnly,
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

      if (matchedPending) {
        return next({
          status: 400,
          message: `${url} already exists in the list of pending sources`,
        });
      }

      if (matchedSource) {
        return next({
          status: 400,
          message: `${url} already exists in the list of ${matchedSource.isReliable ? 'reliable' : 'unreliable'} sources`,
        });
      }

      const cheerioDoc = cheerio.load(await rp(url));
      const brand = getSourceBrand(cheerioDoc) || getDomainOnly(url);
      const title = getTitle(cheerioDoc);
      // const socialScore = await getSocialScore(url);
      // const { countryRank, worldRank, sourceUrl } = await getAlexaRank(url);
      const faviconUrl = getFaviconUrl(cheerioDoc, url);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, url);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const {
        reliable,
        sourceUrl,
        pct,
        sourcePct,
        contentPct,
        socialScore,
        countryRank,
        worldRank,
      } = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: (hasAboutPage && aboutUsUrl) ? 1 : 0,
          sourceHasContactPage: (hasContactPage && contactUsUrl) ? 1 : 0,
          url,
        },
        json: true,
      });
      const isReliablePred = Boolean(reliable);
      const sourceCleanUrl = cleanUrl(sourceUrl);

      const pendingSourceInfo = {
        ...pendingSource,
        id: await r.uuid(sourceCleanUrl).run(conn),
        url: sourceCleanUrl,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        prediction: {
          isReliable: isReliablePred,
          pct,
          sourcePct,
          contentPct,
        },
        socialScore,
        countryRank,
        worldRank,
        brand,
        faviconUrl,
        aboutUsUrl,
        contactUsUrl,
        title,
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

      delete pendingSource.isReliablePred;

      const newSource = {
        ...pendingSource,
        isReliable,
        verifiedByUserId: req.user.id,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
      };

      const { changes: insertedVals } = await r.table('sources')
        .insert(newSource, { returnChanges: true, conflict: 'replace' })
        .run(conn);
      const insertedVal = insertedVals[0].new_val;

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'verify',
        timestamp: r.expr(insertedVal.timestamp).inTimezone(PH_TIMEZONE),
        sourceId: newSource.id,
        table: tbl,
        isReliable,
      }).run(conn);

      res.json(insertedVal);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
