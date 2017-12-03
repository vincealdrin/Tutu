const router = require('express').Router();
const r = require('rethinkdb');
const natural = require('natural');
const { mapArticle } = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      neLng,
      neLat,
      nwLng,
      nwLat,
      seLng,
      seLat,
      swLng,
      swLat,
      limit = 500,
      keywords = '',
      categories = '',
      sources = '',
      timeWindow,
    } = req.query;
    const bounds = r.polygon(
      [parseFloat(swLng), parseFloat(swLat)],
      [parseFloat(seLng), parseFloat(seLat)],
      [parseFloat(neLng), parseFloat(neLat)],
      [parseFloat(nwLng), parseFloat(nwLat)],
    );
    const catsArr = categories.split(',');

    try {
      const totalCount = await r.table(tbl).count().run(conn);

      let query = await r.table(tbl).getIntersecting(bounds, {
        index: 'positions',
      });

      if (timeWindow) {
        const [start, end] = timeWindow.split(',');
        const now = new Date();
        const startDate = new Date();
        startDate.setDate(now.getDate() - parseInt(start));
        const endDate = new Date();
        endDate.setDate(now.getDate() - parseInt(end));

        query = query.filter((article) => article('publishDate').date().during(
          r.time(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), '+08:00'),
          r.time(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), '+08:00'),
          { rightBound: 'closed' }
        ));
      }

      if (keywords) {
        query = query.filter((article) => article('body').match(`${keywords.replace(',', '|')}`));
      }

      if (categories) {
        query = query.filter((article) => article('categories')
          .orderBy(r.desc((category) => category('score')))
          .slice(0, catsArr.length)
          .concatMap((c) => [c('label')])
          .eq(r.expr(catsArr)));
      }

      query = query.eqJoin(r.row('sourceId'), r.table('sources'));

      if (sources) {
        query = query.filter((article) => r.expr(sources.split(',')
          .contains(article('right')('contentData')('siteData')('title'))));
      }

      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const cursor = await query
        .distinct()
        .map(mapArticle(bounds, catsArr.length))
        .run(conn);
      const articles = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/recent', async (req, res, next) => {
    try {
      const { limit = 15 } = req.query;
      const lastWk = new Date();
      lastWk.setDate(lastWk.getDate() - 7);

      const query = r.table(tbl)
        .filter(r.row('timestamp').date().ge(lastWk));
      const totalCount = await query.count().run(conn);
      const cursor = await query
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .map(mapArticle())
        .orderBy(r.desc('timestamp'))
        .limit(parseInt(limit))
        .run(conn);
      const articles = await cursor.toArray();

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
        article('timestamp')
          .during(article('timestamp').date(), r.time(article('timestamp').year(), article('timestamp').month(), article('timestamp').day(), '+08:00'))
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

  return router;
};
