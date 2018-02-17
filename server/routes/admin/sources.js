const router = require('express').Router();
const r = require('rethinkdb');
const cheerio = require('cheerio');
const rp = require('request-promise');
const {
  getAboutContactUrl,
  getFaviconUrl,
  getSourceBrand,
  getTitle,
  getSocialScore,
  cleanUrl,
  PH_TIMEZONE,
  getUpdatedFields,
  getAlexaRank,
  getDomain,
  getDomainCreationDate,
  getWotReputation,
} = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'sources';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      filter = '',
      search = '',
      isReliable = true,
    } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const parsedIsReliable = JSON.parse(isReliable);

    try {
      let query = r.table(tbl).filter(r.row('isReliable').eq(parsedIsReliable));

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const totalCount = await query.count().run(conn);
      const cursor = await query
        .orderBy(r.desc('timestamp'))
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
        // .eqJoin('verifiedByUserId', r.table('users'))
        .map({
          brand: r.row('brand'),
          timestamp: r.row('timestamp'),
          url: r.row('url'),
          id: r.row('id'),
          contactUsUrl: r.row('contactUsUrl'),
          aboutUsUrl: r.row('aboutUsUrl'),
          // verifiedBy: r.row('right')('name'),
          // verifiedBy: '',
        })
        .merge((source) => ({
          vote: r.table('sourceRevotes').get(r.uuid(source('id').add(req.user.id))),
          votesCount: r.table('sourceRevotes')
            .filter((vote) => vote('sourceId').eq(source('id')))
            .count(),
        }))
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
    const {
      urls,
      isReliable,
    } = req.body;

    try {
      const sourcesWithId = await Promise.all(urls.map(async (source) => {
        const uuid = await r.uuid(cleanUrl(source)).run(conn);

        return {
          id: uuid,
          url: cleanUrl(source),
        };
      }));
      const uuids = sourcesWithId.map((source) => source.id);
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

      if (matchedPendings.length || matchedSources.length) {
        const errorMessage = [];

        sourcesWithId.forEach((source) => {
          const foundSource = matchedSources.find((ms) => ms.id === source.id);
          if (foundSource) {
            errorMessage.push(`${foundSource.url} already exists in the list of ${foundSource.isReliable ? 'reliable' : 'unreliable'} sources`);
            return;
          }

          const foundPending = matchedPendings.find((mp) => mp.id === source.id);
          if (foundPending) {
            errorMessage.push(`${foundPending.url} already exists in the list of pending sources`);
          }
        });

        return next({
          status: 400,
          message: errorMessage,
        });
      }

      const sourcesInfo = await Promise.all(sourcesWithId.map(async (source) => {
        const cheerioDoc = cheerio.load(await rp(source.url));
        const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, source.url);
        const faviconUrl = getFaviconUrl(cheerioDoc, source.url);
        const title = getTitle(cheerioDoc);
        const { countryRank, worldRank, sourceUrl } = await getAlexaRank(source.url);
        const sourceCleanUrl = cleanUrl(sourceUrl);
        const socialScore = await getSocialScore(source.url);
        const brand = getSourceBrand(cheerioDoc) || getDomain(source.url);
        const wotReputation = await getWotReputation(source.url);
        // const domainCreationDate = getDomainCreationDate(source.url);

        return {
          ...source,
          url: sourceCleanUrl,
          verifiedByUserId: req.user.id,
          timestamp: r.now().inTimezone(PH_TIMEZONE),
          // domainCreationDate: r.expr(domainCreationDate).date(),
          wotReputation,
          title,
          isReliable,
          socialScore,
          countryRank,
          worldRank,
          faviconUrl,
          aboutUsUrl,
          contactUsUrl,
          brand,
        };
      }));

      const { changes } = await r.table(tbl)
        .insert(sourcesInfo, { returnChanges: true })
        .run(conn);
      const insertedVals = changes.map((change) => change.new_val);

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'create',
        sourceIds: sourcesInfo.map((info) => info.id),
        timestamp: r.expr(insertedVals[0].timestamp).inTimezone(PH_TIMEZONE),
        table: tbl,
      }).run(conn);

      return res.json(insertedVals.map((insertedVal) => ({
        ...insertedVal,
        verifiedBy: req.user.name,
      })));
    } catch (e) {
      next(e);
    }
  });

  router.put('/:id/revote', async (req, res, next) => {
    const { comment } = req.body;
    const { id } = req.params;

    try {
      const votes = await r.table('sourceRevotes')
        .filter(r.row('sourceId').eq(id))
        .count()
        .run(conn);
      const matchedVote = await r.table('sourceRevotes').get(r.uuid(id + req.user.id)).run(conn);
      const totalJourns = await r.table('users').filter(r.row('role').eq('curator')).count().run(conn);
      const timestamp = await r.now().inTimezone(PH_TIMEZONE).run(conn);
      let votingStatus = 'started';

      if (matchedVote) {
        await r.table('sourceRevotes').get(matchedVote.id).delete().run(conn);

        votingStatus = 'removed';
      } else if (votes + 1 === totalJourns || (!matchedVote && totalJourns === 1)) {
        await r.table('sourceRevotes').filter(r.row('sourceId').eq(id)).delete().run(conn);
        const { changes } = await r.table('sources')
          .get(id)
          .delete({ returnChanges: true })
          .run(conn);
        const source = changes[0].old_val;
        const newPendingSource = {
          ...source,
          isReliablePred: null,
          isRevote: true,
          timestamp,
        };

        await r.table('pendingSources').insert(newPendingSource).run(conn);

        votingStatus = 'ended';
      } else {
        await r.table('sourceRevotes').insert({
          id: r.uuid(id + req.user.id),
          sourceId: id,
          userId: req.user.id,
          comment,
          timestamp,
        }).run(conn);
      }

      await r.table('usersFeed').insert({
        userId: req.user.id,
        type: 'revote',
        // updated: getUpdatedFields(changes),
        sourceId: id,
        table: tbl,
        timestamp,
      }).run(conn);

      res.json({ votingStatus });
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
        updated: getUpdatedFields(changes),
        sourceId: source.id,
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

      res.sendStatus(204);
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

      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
