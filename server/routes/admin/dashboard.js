const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  router.get('/count', async (req, res, next) => {
    try {
      const { table } = req.query;
      const count = await r.table(table).count().run(conn);

      return res.json({ count });
    } catch (e) {
      next(e);
    }
  });

  return router;
};
