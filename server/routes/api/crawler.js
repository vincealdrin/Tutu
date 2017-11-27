const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'crawlerLogs';

  router.get('/logs', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 7);

      const cursor = await r.table(tbl)
        .filter(r.row('timestamp').ge(date))
        .run(conn);
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
