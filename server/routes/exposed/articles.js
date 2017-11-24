const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      limit = 15,
      lng = 0,
      lat = 0,
      maxDist = 100,
    } = req.query;
    const point = r.point(parseFloat(lng), parseFloat(lat));
    const articlesArea = {
      index: 'positions',
      maxDist: parseFloat(maxDist),
      unit: 'km',
      maxResults: parseInt(limit),
    };

    try {
      const totalCount = await r.table(tbl).count().run(conn);
      const cursor = await r.table(tbl)
        .getNearest(point, articlesArea)
        .eqJoin(r.row('doc')('sourceId'), r.table('sources'))
        .zip()
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
