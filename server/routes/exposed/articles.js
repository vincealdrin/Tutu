const { mapArticle } = require('../../utils');

const router = require('express').Router();
const r = require('rethinkdb');

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
      limit = 15,
    } = req.query;
    const bounds = r.polygon(
      [parseFloat(swLng), parseFloat(swLat)],
      [parseFloat(seLng), parseFloat(seLat)],
      [parseFloat(neLng), parseFloat(neLat)],
      [parseFloat(nwLng), parseFloat(nwLat)],
    );

    const params = {
      index: 'positions',
      // maxResults: parseInt(limit),
    };

    try {
      const totalCount = await r.table(tbl).count().run(conn);
      const cursor = await r.table(tbl)
        .getIntersecting(bounds, params)
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .map(mapArticle(bounds))
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
      const now = r.now().inTimezone('+08:00').date();
      const query = r.table(tbl)
        .filter(r.row('timestamp').date().during(lastWk, now), { leftBound: 'closed', rightBound: 'closed' });
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

  return router;
};
