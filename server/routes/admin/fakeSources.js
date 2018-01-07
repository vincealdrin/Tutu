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
  const tbl = 'fakeSources';

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
        .eqJoin('verifiedByUserId', r.table('users'))
        .map({
          brand: r.row('left')('brand'),
          timestamp: r.row('left')('timestamp'),
          url: r.row('left')('url'),
          id: r.row('left')('id'),
          verifiedBy: r.row('right')('name'),
        })
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
    const fakeSources = req.body;

    try {
      const sources = await Promise.all(fakeSources.map(async (source) => {
        const url = cleanUrl(source);
        const validUrl = putHttpUrl(url);
        const cheerioDoc = cheerio.load(await rp(validUrl));
        const brand = getSourceBrand(cheerioDoc) || validUrl;
        const socialScore = await getSocialScore(validUrl);
        const { countryRank, worldRank, sourceUrl } = await getAlexaRank(validUrl);
        const sourceCleanUrl = putHttpUrl(cleanUrl(sourceUrl));
        const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, sourceCleanUrl);
        const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
        const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

        return {
          id: await r.uuid(sourceCleanUrl).run(conn),
          url: sourceCleanUrl,
          timestamp: new Date(),
          verifiedBy: req.user.id,
          socialScore,
          countryRank,
          worldRank,
          brand,
          hasAboutPage,
          hasContactPage,
        };
      }));
      const uuids = sources.map((source) => source.id);
      const pendingCursor = await r.table('pendingSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedPendings = await pendingCursor.toArray();
      const sourceCursor = await r.table('sources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedSources = await sourceCursor.toArray();
      const fakeCursor = await r.table('fakeSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedFakes = await fakeCursor.toArray();

      if (matchedPendings.length || matchedSources.length || matchedFakes.length) {
        const errorMessage = [];

        sources.forEach((source) => {
          const foundFake = matchedFakes.find((mf) => mf.id === source.id);
          if (foundFake) {
            errorMessage.push(`${foundFake.url} already exists in list of fake sources`);
            return;
          }

          const foundPending = matchedPendings.find((mp) => mp.id === source.id);
          if (foundPending) {
            errorMessage.push(`${foundPending.url} already exists in list of pending sources`);
            return;
          }

          const foundSource = matchedSources.find((ms) => ms.id === source.id);
          if (foundSource) {
            errorMessage.push(`${foundSource.url} already exists in list of reliable sources`);
          }
        });

        return next({
          status: 400,
          message: errorMessage.join(','),
        });
      }

      const { changes } = await r.table(tbl)
        .insert(sources, { returnChanges: true })
        .run(conn);
      const insertedVals = changes.map((change) => change.new_val);

      await r.table('usersFeed').insert({
        user: req.user.id,
        type: 'create',
        sourceIds: sources.map((source) => source.id),
        timestamp: insertedVals[0].timestamp,
        table: tbl,
      }).run(conn);

      return res.json(insertedVals);
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
        user: req.user.id,
        type: 'update',
        updated: getUpdatedFields(changes),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        table: tbl,
        sourceId: source.id,
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
        user: req.user.id,
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
        user: req.user.id,
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

  return router;
};
