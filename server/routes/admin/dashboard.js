const router = require('express').Router();
const r = require('rethinkdb');
const _ = require('lodash');
const { getCategoriesField } = require('../../utils');

module.exports = (conn, io) => {
  router.get('/visits', async (req, res, next) => {
    try {
      return res.json({
        visitors: await r.table('visitors').count().run(conn),
        articles: await r.table('articles').count().run(conn),
        pendingSources: await r.table('pendingSources').count().run(conn),
        credibleSources: await r.table('sources')
          .filter(r.row('isReliable').eq(true))
          .count()
          .run(conn),
        notCredibleSources: await r.table('sources')
          .filter(r.row('isReliable').eq(false))
          .count()
          .run(conn),
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/sourcesSubmit', async (req, res, next) => {
    try {
      const verifiedSources = await r.table('sources')
        .group(r.row('timestamp').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          credible: group('reduction').filter((source) => source('isReliable').eq(true)).count(),
          notCredible: group('reduction').filter((source) => source('isReliable').eq(false)).count(),
        }))
        .run(conn);
      const pendingSources = await r.table('pendingSources')
        .group(r.row('timestamp').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          pending: group('reduction').count(),
        }))
        .run(conn);

      return res.json({
        verifiedSources,
        pendingSources,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/counts', async (req, res, next) => {
    try {
      return res.json({
        visitors: await r.table('visitors').count().run(conn),
        articles: await r.table('articles').count().run(conn),
        pendingSources: await r.table('pendingSources').count().run(conn),
        credibleSources: await r.table('sources')
          .filter(r.row('isReliable').eq(true))
          .count()
          .run(conn),
        notCredibleSources: await r.table('sources')
          .filter(r.row('isReliable').eq(false))
          .count()
          .run(conn),
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/top', async (req, res, next) => {
    try {
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

      const date = new Date();
      date.setDate(date.getDate() - 11);

      const cursor = await r.table('articles')
        .filter(r.row('timestamp').date().ge(date))
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

  router.get('/sentiment', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 11);

      const cursor = await r.table('articles')
        .filter(r.row('timestamp').date().ge(date))
        .group(r.row('timestamp').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          sentiment: group('reduction')
            .map((article) => r.branch(
              article('sentiment')('compound').ge(0.5),
              { pos: 1, neu: 0, neg: 0 },
              article('sentiment')('compound').le(-0.5),
              { pos: 0, neu: 0, neg: 1 },
              { pos: 0, neu: 1, neg: 0 }
            ))
            .reduce((left, right) => ({
              pos: left('pos').add(right('pos')),
              neu: left('neu').add(right('neu')),
              neg: left('neg').add(right('neg')),
            })),
        }))
        .run(conn);
      const sentiment = await cursor.toArray();

      return res.json(sentiment);
    } catch (e) {
      next(e);
    }
  });

  router.get('/categories', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 11);

      const cursor = await r.table('articles')
        .filter(r.row('timestamp').date().ge(date))
        .group(r.row('timestamp').date())
        .ungroup()
        .map((group) => ({
          date: group('group'),
          categories: group('reduction')
            .map((article) => {
              const categories = getCategoriesField(article);
              return {
                Economy: r.branch(categories.contains('Economy'), 1, 0),
                Lifestyle: r.branch(categories.contains('Lifestyle'), 1, 0),
                Sports: r.branch(categories.contains('Sports'), 1, 0),
                Politics: r.branch(categories.contains('Politics'), 1, 0),
                Health: r.branch(categories.contains('Health'), 1, 0),
                Crime: r.branch(categories.contains('Crime'), 1, 0),
                Weather: r.branch(categories.contains('Weather'), 1, 0),
                Culture: r.branch(categories.contains('Culture'), 1, 0),
                Environment: r.branch(categories.contains('Environment'), 1, 0),
                'Business & Finance': r.branch(categories.contains('Business & Finance'), 1, 0),
                'Disaster & Accident': r.branch(categories.contains('Disaster & Accident'), 1, 0),
                'Entertainment & Arts': r.branch(categories.contains('Entertainment & Arts'), 1, 0),
                'Law & Government': r.branch(categories.contains('Law & Government'), 1, 0),
                'Science & Technology': r.branch(categories.contains('Science & Technology'), 1, 0),
              };
            })
            .reduce((left, right) => ({
              Economy: left('Economy').add(right('Economy')),
              Lifestyle: left('Lifestyle').add(right('Lifestyle')),
              Sports: left('Sports').add(right('Sports')),
              Politics: left('Politics').add(right('Politics')),
              Health: left('Health').add(right('Health')),
              Crime: left('Crime').add(right('Crime')),
              Weather: left('Weather').add(right('Weather')),
              Culture: left('Culture').add(right('Culture')),
              Environment: left('Environment').add(right('Environment')),
              'Business & Finance': left('Business & Finance').add(right('Business & Finance')),
              'Disaster & Accident': left('Disaster & Accident').add(right('Disaster & Accident')),
              'Entertainment & Arts': left('Entertainment & Arts').add(right('Entertainment & Arts')),
              'Law & Government': left('Law & Government').add(right('Law & Government')),
              'Science & Technology': left('Science & Technology').add(right('Science & Technology')),
            })),
        }))
        .run(conn);

      return res.json(cursor);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
