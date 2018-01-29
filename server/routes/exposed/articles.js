const router = require('express').Router();
const r = require('rethinkdb');
const _ = require('lodash');
const {
  mapArticle,
  mapArticleInfo,
  PH_TIMEZONE,
  mapGridArticle,
  buildArticlesQuery,
  mergeRelatedArticles,
} = require('../../utils');

const DAY_IN_SECONDS = 86400;

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      limit,
      page,
      isCredible = 'yes',
      isMap = 'yes',
    } = req.query;

    try {
      let query = await buildArticlesQuery(req.query);

      query = query.filter(r.row('right')('isReliable').eq(isCredible === 'yes'));

      let totalCount = 0;

      if (page && limit) {
        totalCount = await query.count().run(conn);
      }

      query = query.orderBy(r.desc(r.row('left')('publishDate')));

      if (page && limit) {
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        query = query.slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit);
      } else if (limit) {
        query = query.limit(parseInt(limit));
      }

      const cursor = await query
        .map(isMap === 'yes' ? mapArticle : mapGridArticle)
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
        .merge(mergeRelatedArticles(isCredible === 'yes'))
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

  router.post('/clusterInfo', async (req, res, next) => {
    try {
      const {
        ids,
        isCredible = 'yes',
        limit = 15,
        page = 0,
        keywords = [],
        sort = 'publishDate-DESC',
      } = req.body;
      const [field, order] = sort.split('-');
      let query = await r.table(tbl).getAll(r.args(ids));

      if (keywords.length) {
        query = query.filter((article) => {
          const keywordsRgx = `(?i)\\b(${keywords.join('|')})\\b`;
          return article('body').match(keywordsRgx).or(article('title').match(keywordsRgx));
        });
      }

      const totalCount = await query.count().run(conn);

      const articles = await query
        .orderBy(order === 'DESC' ? r.desc(field) : field)
        .slice(page * limit, (page + 1) * limit)
        .merge(mergeRelatedArticles(isCredible === 'yes'))
        .map(mapArticleInfo())
        // .without(
        //   'timestamp', 'body', 'id',
        //   'summary2', 'url', 'title',
        //   'publishDate', 'sourceId', 'locations',
        //   'popularity', 'topics'
        // )
        .run(conn);

      // console.log(articles);

      res.setHeader('X-Total-Count', totalCount);
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
        id,
        isCredible = 'yes',
        limit = '5',
        page,
      } = req.query;
      const parsedLimit = parseInt(limit);
      const relArticlesIds = await r.table(tbl)
        .get(id)
        .getField('relatedArticles')
        .run(conn);
      const cursor = await r.table(tbl)
        .getAll(r.args(relArticlesIds))
        .eqJoin('sourceId', r.table('sources'))
        .filter(r.row('right')('isReliable').eq(isCredible === 'yes'))
        .limit(parsedLimit)
        .map((join) => ({
          title: join('left')('title'),
          url: join('left')('url'),
          publishDate: join('left')('publishDate'),
          source: join('right')('brand'),
          sourceUrl: join('right')('url'),
        }))
        .run(conn);
      const relatedArticles = await cursor.toArray();

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
