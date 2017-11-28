const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'crawlerLogs';

  router.get('/stats', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 7);

      const cursor = await r.table(tbl)
        .filter(r.row('timestamp').ge(date))
        .group(r.row('timestamp').date())
        .ungroup()
        .map({
          date: r.row('group'),
          successCount: r.row('reduction')
            .filter((article) => article('type').eq('articleCrawl').and(article('status').eq('success'))).count(),
          errorCount: r.row('reduction')
            .filter((article) => article('type').eq('articleCrawl').and(article('status').eq('error'))).count(),
        })
        .run(conn);
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
