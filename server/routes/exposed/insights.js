const router = require('express').Router();
const r = require('rethinkdb');
const {
  buildArticlesQuery,
  reduceCategoriesInsight,
  mapCategoriesInsight,
  mapSentimentInsight,
  reduceSentimentInsight,
} = require('../../utils');

module.exports = (conn) => {
  router.post('/top', async (req, res, next) => {
    try {
      const { ids } = req.body;
      const { field, limit = '10' } = req.query;
      let fieldName = '';

      switch (field) {
      case 'locations':
        fieldName = 'location';
        break;
      case 'people':
        fieldName = 'person';
        break;
      case 'organizations':
        fieldName = 'organization';
        break;
      case 'keywords':
        fieldName = 'keyword';
        break;
      default:
        return next({
          status: 400,
          message: 'Wrong field value',
        });
      }

      const cursor = await r.table('articles')
        .getAll(r.args(ids))
        // .limit(10)
        .getField(field)
        .reduce((left, right) => left.add(right))
        .map((row) => r.object(fieldName, field === 'locations' ? (
          r.branch(
            row('found').eq('location'),
            row('location')('formattedAddress'),
            row('province')('name').add(', Philippines'),
          )) : row))
        .group(fieldName)
        .ungroup()
        .map(r.object(
          fieldName,
          r.row('group'),
          'count',
          r.row('reduction').count()
        ))
        .orderBy(r.desc('count'))
        .limit(parseInt(limit))
        .run(conn);
      const words = await cursor.toArray();

      return res.json(words);
    } catch (e) {
      next(e);
    }
  });

  router.get('/top', async (req, res, next) => {
    try {
      const { field, limit } = req.query;
      let fieldName = '';

      switch (field) {
      case 'locations':
        fieldName = 'location';
        break;
      case 'people':
        fieldName = 'person';
        break;
      case 'organizations':
        fieldName = 'organization';
        break;
      case 'keywords':
        fieldName = 'keyword';
        break;
      default:
        return next({
          status: 400,
          message: 'Wrong field value',
        });
      }

      const query = await buildArticlesQuery(req.query);
      const metaInsights = await query
        .zip()
        .getField(field)
        .reduce((left, right) => left.add(right))
        .map((row) => r.object(fieldName, field === 'locations' ? (
          r.branch(
            row('found').eq('location'),
            row('location')('formattedAddress'),
            row('province')('name').add(', Philippines'),
          )) : row))
        .group(fieldName)
        .ungroup()
        .map(r.object(
          fieldName,
          r.row('group'),
          'count',
          r.row('reduction').count()
        ))
        .orderBy(r.desc('count'))
        .limit(parseInt(limit))
        .run(conn);

      return res.json(metaInsights);
    } catch (e) {
      next(e);
    }
  });

  router.post('/sentiments', async (req, res, next) => {
    try {
      const { ids } = req.body;

      const cursor = await r.table('articles')
        .getAll(r.args(ids))
        .group(r.row('publishDate').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          sentiment: group('reduction')
            .map(mapSentimentInsight)
            .reduce(reduceSentimentInsight),
        }))
        .run(conn);
      const sentiment = await cursor.toArray();

      return res.json(sentiment);
    } catch (e) {
      next(e);
    }
  });

  router.get('/sentiments', async (req, res, next) => {
    try {
      const query = await buildArticlesQuery(req.query);
      const sentInsights = await query
        .group(r.row('left')('publishDate').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          sentiment: group('reduction')
            .map((join) => mapSentimentInsight(join('left')))
            .reduce(reduceSentimentInsight),
        }))
        .run(conn);

      return res.json(sentInsights);
    } catch (e) {
      next(e);
    }
  });

  router.post('/categories', async (req, res, next) => {
    try {
      const { ids } = req.body;

      const catInsights = await r.table('articles')
        .getAll(r.args(ids))
        .group(r.row('publishDate').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          categories: group('reduction')
            .map(mapCategoriesInsight)
            .reduce(reduceCategoriesInsight),
        }))
        .run(conn);

      return res.json(catInsights);
    } catch (e) {
      next(e);
    }
  });

  router.get('/categories', async (req, res, next) => {
    try {
      const query = await buildArticlesQuery(req.query);
      const catInsights = await query
        .group(r.row('left')('publishDate').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          categories: group('reduction')
            .map((join) => mapCategoriesInsight(join('left')))
            .reduce(reduceCategoriesInsight),
        }))
        .run(conn);

      return res.json(catInsights);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
