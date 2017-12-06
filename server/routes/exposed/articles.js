const router = require('express').Router();
const r = require('rethinkdb');
const natural = require('natural');
const { mapArticle, PH_TIMEZONE } = require('../../utils');

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
      orgs = '',
      people = '',
      sources = '',
      timeWindow = '7,0',
      popular = '',
      sentiment = '',
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
          r.time(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate(), PH_TIMEZONE),
          r.time(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate(), PH_TIMEZONE),
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

      if (orgs) {
        query = query.filter((article) => r.expr(orgs.split(','))
          .contains((org) => article('organizations').contains(org)));
      }

      if (people) {
        query = query.filter((article) => r.expr(people.split(','))
          .contains((person) => article('people').contains(person)));
      }

      if (sentiment) {
        if (sentiment === 'positive') {
          query = query.filter((article) => article('sentiment')('compound').ge(0.5));
        } else if (sentiment === 'negative') {
          query = query.filter((article) => article('sentiment')('compound').le(-0.5));
        } else {
          query = query.filter((article) => article('sentiment')('compound').gt(0.5)
            .and(article('sentiment')('compound').lt(-0.5)));
        }
      }

      if (popular) {
        const [socialNetworks, top] = popular.split('|');
        const socials = socialNetworks.split(',');
        const topCount = parseInt(top);

        if (socials[0] === 'all') {
          query = query.filter((article) => article('popularity')('totalCount').gt(0));
        } else {
          switch (socials.length) {
          case 2:
            query = query.filter((article) => article('popularity')(socials[0]).gt(0)
              .or(article('popularity')(socials[1]).gt(0)));
            break;
          case 3:
            query = query.filter((article) => article('popularity')(socials[0]).gt(0)
              .or(article('popularity')(socials[1]).gt(0))
              .or(article('popularity')(socials[2]).gt(0)));
            break;
          case 4:
            query = query.filter((article) => article('popularity')(socials[0]).gt(0)
              .or(article('popularity')(socials[1]).gt(0))
              .or(article('popularity')(socials[2]).gt(0))
              .or(article('popularity')(socials[3]).gt(0)));
            break;
          case 5:
            query = query.filter((article) => article('popularity')(socials[0]).gt(0)
              .or(article('popularity')(socials[1]).gt(0))
              .or(article('popularity')(socials[2]).gt(0))
              .or(article('popularity')(socials[3]).gt(0))
              .or(article('popularity')(socials[4]).gt(0)));
            break;
          default:
            query = query.filter((article) => article('popularity')(socials[0]).gt(0));
          }

          if (socials[0] === 'all') {
            query = query.orderBy(r.desc(r.row('popularity')('totalCount')));
          } else {
            query = query.orderBy(r.desc(r.row('popularity')(socials[0])));
          }

          if (socials[1]) {
            query = query.orderBy(r.desc(r.row('popularity')(socials[1])));
          }
          if (socials[2]) {
            query = query.orderBy(r.desc(r.row('popularity')(socials[2])));
          }
          if (socials[3]) {
            query = query.orderBy(r.desc(r.row('popularity')(socials[3])));
          }
          if (socials[4]) {
            query = query.orderBy(r.desc(r.row('popularity')(socials[4])));
          }
        }

        query = query.slice(0, topCount);
      }

      query = query.eqJoin(r.row('sourceId'), r.table('sources'));

      if (sources) {
        query = query.filter((article) => r.expr(sources.split(','))
          .contains((source) => article('right')('contentData')('siteData')('title')
            .match(source)));
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

  router.get('/popular', async (req, res, next) => {
    try {
      const { limit = 15 } = req.query;
      const lastWk = new Date();
      lastWk.setDate(lastWk.getDate() - 7);

      const cursor = await r.table(tbl).filter((article) => article('popularity')('totalCount').gt(0))
        .orderBy(r.desc(r.row('popularity')('totalCount')))
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .map(mapArticle())
        .slice(0, limit)
        .run(conn);
      const articles = await cursor.toArray();

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

      const query = r.table(tbl).filter(r.row('timestamp').date().ge(lastWk));
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
          .during(article('timestamp').date(), r.time(article('timestamp').year(), article('timestamp').month(), article('timestamp').day(), PH_TIMEZONE))
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
