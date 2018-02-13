const router = require('express').Router();
const r = require('rethinkdb');
const { mapLog } = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'crawlerLogs';


  router.get('/logs', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 3);

      const cursor = await r.table(tbl)
        .filter(r.row('timestamp').date().ge(date))
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .orderBy(r.desc(r.row('left')('timestamp')))
        .limit(50)
        .map(mapLog)
        .run(conn, { arrayLimit: 1000000000 });
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });


  router.get('/stats', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 7);

      const cursor = await r.table(tbl)
        // .filter(r.row('timestamp').ge(date).and(r.row('errorMessage').default('').ne('EXISTING URL')))
        .filter(r.row('timestamp'))
        .group(r.row('timestamp').date())
        .ungroup()
        .map({
          date: r.row('group'),
          successCount: r.row('reduction')
            .filter((log) => log('type').eq('articleCrawl').and(log('status').eq('success'))).count(),
          errorCount: r.row('reduction')
            .filter((log) => log('type').eq('articleCrawl').and(log('status').eq('error'))).count(),
        })
        .run(conn, { arrayLimit: 1000000000 });
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
