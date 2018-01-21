const router = require('express').Router();
const r = require('rethinkdb');
const natural = require('natural');
const _ = require('lodash');
const {
  mapArticle,
  mapArticleInfo,
  PH_TIMEZONE,
  mapRelatedArticles,
  mapGridArticle,
  buildArticlesQuery,
} = require('../../utils');

const DAY_IN_SECONDS = 86400;

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      limit,
      page,
      neLng,
      neLat,
      nwLng,
      nwLat,
      seLng,
      seLat,
      swLng,
      swLat,
      isCredible = 'yes',
    } = req.query;
    let bounds;

    if (neLng && neLat && nwLng && nwLat &&
      seLng && seLat && swLng && swLat) {
      bounds = r.polygon(
        [parseFloat(swLng), parseFloat(swLat)],
        [parseFloat(seLng), parseFloat(seLat)],
        [parseFloat(neLng), parseFloat(neLat)],
        [parseFloat(nwLng), parseFloat(nwLat)]
      );
    }

    try {
      let query = await buildArticlesQuery(req.query, bounds);

      query = query.filter(r.row('right')('isReliable').eq(isCredible === 'yes'));

      let totalCount = 0;

      if (page && limit) {
        totalCount = await query.count().run(conn);
      }

      if (page && limit) {
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        query = query.slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit);
      } else if (limit) {
        query = query.limit(parseInt(limit));
      }

      const cursor = await query
        .map(bounds ? mapArticle(bounds) : mapGridArticle)
        .distinct()
        .run(conn);
      const articles = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/info', async (req, res, next) => {
    try {
      const {
        id,
        isCredible = 'yes',
      } = req.query;
      const articleInfo = await r.table(tbl)
        .get(id)
        .merge((article) => mapArticleInfo()(article))
        .merge((article) => ({
          relatedArticles: r.table(tbl)
            .getAll(r.args(article('relatedArticles')))
            .eqJoin('sourceId', r.table('sources'))
            .filter((join) => join('right')('isReliable').eq(isCredible === 'yes'))
            .limit(5)
            .map(mapRelatedArticles)
            .coerceTo('array'),
        }))
        .without(
          'timestamp', 'body', 'id',
          'summary2', 'title', 'locations',
          'publishDate', 'sourceId',
          'popularity', 'topics'
        )
        .run(conn);

      res.json(articleInfo);
    } catch (e) {
      next(e);
    }
  });

  router.get('/clusterInfo', async (req, res, next) => {
    try {
      const {
        ids,
        isCredible = 'yes',
      } = req.query;
      const uuids = ids.split(',');
      const cursor = await r.table(tbl)
        .getAll(r.args(uuids))
        .merge((article) => ({
          relatedArticles: r.table(tbl)
            .getAll(r.args(article('relatedArticles')))
            .eqJoin('sourceId', r.table('sources'))
            .filter((join) => join('right')('isReliable').eq(isCredible === 'yes'))
            .limit(5)
            .map(mapRelatedArticles)
            .coerceTo('array'),
        }))
        .map(mapArticleInfo())
        // .without(
        //   'timestamp', 'body', 'id',
        //   'summary2', 'url', 'title',
        //   'publishDate', 'sourceId', 'locations',
        //   'popularity', 'topics'
        // )
        .run(conn);
      const articles = await cursor.toArray();

      // console.log(articles);

      res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/popular', async (req, res, next) => {
    try {
      const {
        limit = '20',
        isCredible = 'yes',
      } = req.query;

      const query = await r.table(tbl)
        .orderBy({ index: r.desc('popularityScore') })
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .filter(r.row('right')('isReliable').eq(isCredible === 'yes')
          .and(r.row('left')('publishDate')
            .ge(r.now().inTimezone(PH_TIMEZONE).sub(2 * DAY_IN_SECONDS))))
        .map((join) => ({
          id: join('left')('id'),
          url: join('left')('url'),
          title: join('left')('title'),
          publishDate: join('left')('publishDate'),
          summary: join('left')('summary').nth(0),
          topImageUrl: join('left')('topImageUrl'),
          source: join('right')('brand'),
          sourceUrl: join('right')('url'),
        }))
        .limit(parseInt(limit));
      const totalCount = query.count().run(conn);
      const cursor = await query.run(conn);
      const articles = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/recent', async (req, res, next) => {
    try {
      const {
        limit = '20',
        isCredible = 'yes',
      } = req.query;

      const totalCount = await r.table('articles').count().run(conn);
      const query = await r.table('articles')
        .orderBy({ index: r.desc('timestamp') })
        .eqJoin('sourceId', r.table('sources'))
        .filter(r.row('right')('isReliable').eq(isCredible === 'yes'))
        .limit(parseInt(limit))
        .map((join) => ({
          id: join('left')('id'),
          url: join('left')('url'),
          title: join('left')('title'),
          timestamp: join('left')('timestamp'),
          summary: join('left')('summary').nth(0),
          topImageUrl: join('left')('topImageUrl'),
          source: join('right')('brand'),
          sourceUrl: join('right')('url'),
        }))
        .run(conn);
      const articles = await query.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });


  router.get('/related', async (req, res, next) => {
    try {
      const {
        title,
        topics,
        people,
        orgs,
        categories,
      } = req.query;
      const catsArr = categories.split(',');
      const cursor = await r.table('articles').filter((article) =>
        article('publishDate').date()
          .during(
            r.time(article('publishDate').year(), article('publishDate').month(), article('publishDate').day().sub(7), PH_TIMEZONE),
            r.time(article('publishDate').year(), article('publishDate').month(), article('publishDate').day().add(7), PH_TIMEZONE), {
              rightBound: 'closed',
            }
          )
          .and(article('categories')
            .orderBy(r.desc((category) => category('score')))
            .slice(0, catsArr.length)
            .concatMap((c) => [c('label')])
            .eq(r.expr(catsArr))
            .and(article('topics')('common').match(`(?i)${topics.replace(',', '|')}`))
            .and(article('people').contains((person) => person.match(`(?i)${people.replace(',', '|')}`))
              .or(article('organizations').contains((org) => org.match(`(?i)${orgs.replace(',', '|')}`))))))
        .pluck('title', 'url')
        .run(conn);
      const articles = await cursor.toArray();
      const relatedArticles = articles
        .filter((article) => natural.DiceCoefficient(title, article.title) > 0.40)
        .slice(0, 5);

      res.json(relatedArticles);
    } catch (e) {
      next(e);
    }
  });

  router.put('/reactions', async (req, res, next) => {
    try {
      const {
        id,
        reaction,
      } = req.body;

      if (!/happy|sad|angry|amused|afraid|inspired/.test(reaction)) {
        next({
          message: 'Invalid reaction',
          status: 400,
        });
      }

      const ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
      const existingReact = await r.table('articles').get(id)('reactions')
        .filter((react) => react('ip').eq(ip))
        .nth(0)
        .default(null)
        .run(conn);

      if (existingReact) {
        return next({
          message: `You already reacted "${_.capitalize(existingReact.reaction)}"`,
          status: 400,
        });
      }

      await r.table('articles').get(id).update({
        reactions: r.row('reactions').append({
          ip,
          reaction,
        }),
      }).run(conn);

      res.status(204).end();
    } catch (e) {
      next({
        message: 'URL not found',
        status: 404,
        ...e,
      });
    }
  });

  return router;
};
