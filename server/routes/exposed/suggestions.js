const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  router.get('/sources', async (req, res, next) => {
    try {
      const query = r.table('sources');
      const sources = await query
        .map({
          key: r.row('contentData')('dataUrl'),
          text: r.row('contentData')('siteData')('title'),
          value: r.row('contentData')('dataUrl'),
        })
        .run(conn);

      res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
