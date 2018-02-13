const router = require('express').Router();
const r = require('rethinkdb');
const cheerio = require('cheerio');
const moment = require('moment');
const rp = require('request-promise');
const validUrl = require('valid-url');
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
  removeUrlPath,
  getDomain,
  cloudScrape,
  getTempBrand,
} = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'pendingSources';

  router.get('/votes', async (req, res, next) => {
    try {
      const { pendingSourceId, isCredible = 'yes' } = req.query;
      console.log(pendingSourceId);
      const cursor = await r.table('pendingSourceVotes')
        .filter(r.row('pendingSourceId').eq(pendingSourceId)
          .and(r.row('isCredible').eq(isCredible === 'yes')))
        .run(conn);
      const votes = await cursor.toArray();

      res.json(votes);
    } catch (e) {
      next(e);
    }
  });

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
        .orderBy(r.desc('isReliablePred'), r.desc('timestamp'))
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
        .merge((source) => ({
          vote: r.table('pendingSourceVotes').get(r.uuid(source('id').add(req.user.id))),
          credibleVotesCount: r.table('pendingSourceVotes')
            .filter((vote) => vote('pendingSourceId').eq(source('id'))
              .and(vote('isCredible').eq(true)))
            .count(),
          notCredibleVotesCount: r.table('pendingSourceVotes')
            .filter((vote) => vote('pendingSourceId').eq(source('id'))
              .and(vote('isCredible').eq(false)))
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
    const pendingSource = req.body;
    const url = cleanUrl(pendingSource.url);

    if (!validUrl.isUri(url)) {
      return next({
        status: 400,
        message: 'Invalid URL',
      });
    }

    try {
      const domain = cleanUrl(removeUrlPath(url));
      const domainOnly = cleanUrl(getDomain(removeUrlPath(url)));
      const uuid = await r.uuid(domain).run(conn);
      const uuidDom = await r.uuid(domainOnly).run(conn);

      const matchedPending = await r.table('pendingSources').get(uuid).run(conn) || await r.table('pendingSources').get(uuidDom).run(conn);
      const matchedSource = await r.table('sources').get(uuid).run(conn) || await r.table('sources').get(uuidDom).run(conn);

      if (matchedPending) {
        return next({
          status: 400,
          message: `${url} already exists in the list of pending sources`,
        });
      }

      if (matchedSource) {
        return next({
          status: 400,
          message: `${url} already exists in the list of ${matchedSource.isReliable ? 'credible' : 'not credible'} sources`,
        });
      }

      let body;
      try {
        body = await rp(url);
      } catch (e) {
        try {
          body = await cloudScrape(url);
        } catch (err) {
          return next({
            status: 500,
            message: 'Can\'t access the article url, please try again later',
          });
        }
      }

      const cheerioDoc = cheerio.load(body);
      const brand = getSourceBrand(cheerioDoc) || getTempBrand(url);
      const title = getTitle(cheerioDoc);
      const faviconUrl = getFaviconUrl(cheerioDoc, url);
      // const wotReputation = await getWotReputation(domain);
      const wotReputation = 0;
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, url);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const {
        isCredible,
        sourceUrl,
        socialScore,
        countryRank,
        worldRank,
      } = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: (hasAboutPage && aboutUsUrl) ? 1 : 0,
          sourceHasContactPage: (hasContactPage && contactUsUrl) ? 1 : 0,
          wotReputation,
          url,
          body,
        },
        json: true,
      });

      const isReliablePred = Boolean(isCredible);
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const cleanedSrcUrl = cleanUrl(sourceUrl);
      const id = await r.uuid(cleanedSrcUrl).run(conn);

      const pendingSourceInfo = {
        url: cleanedSrcUrl,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        senderIpAddress: ipAddress,
        wotReputation,
        id,
        brand,
        isReliablePred,
        aboutUsUrl,
        contactUsUrl,
        socialScore,
        countryRank,
        worldRank,
        faviconUrl,
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
        .update(source)
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

  router.post('/verify', async (req, res, next) => {
    const {
      id,
      isReliable,
      comment,
    } = req.body;

    try {
      const votes = await r.table('pendingSourceVotes')
        .filter(r.row('sourceId').eq(id))
        .group(r.row('isCredible'))
        .count()
        .ungroup()
        .map((x) => [r.branch(x.getField('group'), 'credible', 'notCredible'), x.getField('reduction')])
        .coerceTo('object')
        .run(conn);
      const matchedVote = await r.table('pendingSourceVotes').get(r.uuid(id + req.user.id)).run(conn);
      const totalJourns = await r.table('users').filter(r.row('role').eq('curator')).count().run(conn);
      const totalVotes = (votes.credible || 0) + (votes.notCredible || 0);
      const timestamp = await r.now().inTimezone(PH_TIMEZONE).run(conn);

      console.log(matchedVote);
      console.log(votes);
      console.log(totalVotes + 1);
      console.log(totalJourns);
      if (!matchedVote && (totalVotes + 1) >= totalJourns) {
        const { changes } = await r.table(tbl)
          .get(id)
          .delete({ returnChanges: true })
          .run(conn);

        const pendingSource = changes[0].old_val;

        delete pendingSource.isReliablePred;

        const newSource = {
          ...pendingSource,
          isReliable: votes.credible > votes.notCredible,
          timestamp,
        };

        const { changes: insertedVals } = await r.table('sources')
          .insert(newSource, { returnChanges: true, conflict: 'update' })
          .run(conn);
        const insertedVal = insertedVals[0].new_val;

        res.json(insertedVal);
      } else if (matchedVote && matchedVote.isCredible === isReliable) {
        await r.table('pendingSourceVotes').get(matchedVote.id).delete().run(conn);

        await r.table('usersFeed').insert({
          userId: req.user.id,
          type: 'unvote',
          sourceId: id,
          table: tbl,
          timestamp,
          comment,
        }).run(conn);

        res.sendStatus(200);
      } else {
        const { changes } = await r.table('pendingSourceVotes').insert({
          id: r.uuid(id + req.user.id),
          pendingSourceId: id,
          userId: req.user.id,
          isCredible: isReliable,
          timestamp,
          comment,
          // votingDeadline: totalVotes + 1 === votesThreshold
          //   ? r.expr(moment().add(15, 'days')).inTimezone(PH_TIMEZONE)
          //   : r.row('votingDeadline'),
        }, { returnChanges: true, conflict: 'update' }).run(conn);
        const insertedVal = changes[0].new_val;

        await r.table('usersFeed').insert({
          userId: req.user.id,
          type: 'vote',
          sourceId: id,
          table: tbl,
          timestamp,
          isReliable,
          comment,
        }).run(conn);

        res.json(insertedVal);
      }
    } catch (e) {
      next(e);
    }
  });


  return router;
};
