const router = require('express').Router();
const r = require('rethinkdb');
const natural = require('natural');
const _ = require('lodash');
const {
  mapArticle,
  mapArticleInfo,
  PH_TIMEZONE,
  getCategoriesField,
  mapRelatedArticles,
} = require('../../utils');

const SECONDS_IN_DAYS = 86400;

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
      date = new Date().toLocaleString(),
      popular = '',
      sentiment = '',
      legitimate = 'yes',
    } = req.query;
    const bounds = r.polygon(
      [parseFloat(swLng), parseFloat(swLat)],
      [parseFloat(seLng), parseFloat(seLat)],
      [parseFloat(neLng), parseFloat(neLat)],
      [parseFloat(nwLng), parseFloat(nwLat)]
    );
    const catsArr = categories.split(',');

    try {
      const totalCount = await r.table(tbl).count().run(conn);

      let query = await r.table(tbl).getIntersecting(bounds, {
        index: 'positions',
      }).distinct();

      const [start, end] = timeWindow.split(',');
      const selectedDate = new Date(JSON.parse(date));
      const parsedStart = parseInt(start);
      const parsedEnd = parseInt(end);

      if (!parsedStart && !parsedEnd) {
        query = query.filter((article) =>
          article('publishDate').date()
            .eq(r.expr(selectedDate).inTimezone(PH_TIMEZONE).date()));
      } else {
        const startDate = new Date(selectedDate.getTime());
        startDate.setDate(selectedDate.getDate() - parsedStart);
        const endDate = new Date(selectedDate.getTime());
        endDate.setDate(selectedDate.getDate() - parsedEnd);

        query = query.filter(r.row('publishDate').date().during(
          r.expr(startDate).inTimezone(PH_TIMEZONE).date(),
          r.expr(endDate).inTimezone(PH_TIMEZONE).date(),
          { rightBound: 'closed' }
        ));
      }

      if (keywords) {
        query = query.filter((article) => article('body').match(`(?i)${keywords.replace(',', '|')}`));
      }

      if (categories) {
        query = query.filter((article) => getCategoriesField(article)
          .contains((category) => r.expr(catsArr).contains(category)));
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
          query = query.filter((article) => article('popularity')('totalScore').gt(0));
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
            query = query.orderBy(r.desc(r.row('popularity')('totalScore')));
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

      query = query.eqJoin('sourceId', r.table('sources'));

      if (sources) {
        query = query.filter((article) => article('right')('brand')
          .match(`(?i)${sources.replace(',', '|')}`));
      }

      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const cursor = await query
        .filter(r.row('right')('isReliable').eq(legitimate === 'yes'))
        .map(mapArticle(bounds))
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
        catsFilterLength,
      } = req.query;
      const articleInfo = await r.table(tbl)
        .get(id)
        .merge((article) => mapArticleInfo()(article))
        .merge((article) => ({
          relatedArticles: r.table(tbl)
            .getAll(r.args(article('relatedArticles')))
            .eqJoin('sourceId', r.table('sources'))
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
        catsFilterLength,
      } = req.query;
      const uuids = ids.split(',');
      const cursor = await r.table(tbl)
        .getAll(r.args(uuids))
        .merge((article) => ({
          relatedArticles: r.table(tbl)
            .getAll(r.args(article('relatedArticles')))
            .eqJoin('sourceId', r.table('sources'))
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
      } = req.query;
      const now = new Date();
      now.setDate(now.getDate() - 3);

      const query = await r.table(tbl)
        .orderBy({ index: r.desc('popularityScore') })
        .eqJoin(r.row('sourceId'), r.table('sources'))
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
      const { limit = '20' } = req.query;

      const totalCount = await r.table('articles').count().run(conn);
      const query = await r.table('articles')
        .orderBy({ index: r.desc('timestamp') })
        .eqJoin('sourceId', r.table('sources'))
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
