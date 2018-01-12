const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'usersFeed';

  router.get('/', async (req, res, next) => {
    try {
      const date = new Date();
      date.setDate(date.getDate() - 7);

      const cursor = await r.table(tbl)
        .filter(r.row('timestamp').ge(date))
        .limit(30)
        .orderBy(r.desc(r.row('timestamp')))
        .map((item) => r.branch(
          item('type').eq('create'),
          {
            table: item('table'),
            timestamp: item('timestamp'),
            user: r.table('users').get(item('userId')).getField('name'),
            type: item('type'),
            sources: r.table(item('table')).getAll(r.args(item('sourceIds'))).pluck('brand', 'url').coerceTo('array'),
          },
          item('type').eq('update'),
          {
            table: item('table'),
            timestamp: item('timestamp'),
            user: r.table('users').get(item('userId')).getField('name'),
            type: item('type'),
            updated: item('updated'),
            source: r.table(item('table'))
              .get(item('sourceId'))
              .pluck('brand', 'url')
              .default({ brand: '', url: '' }),
          },
          item('type').eq('delete'),
          {
            table: item('table'),
            timestamp: item('timestamp'),
            user: r.table('users').get(item('userId')).getField('name'),
            type: item('type'),
            deleted: item('deleted'),
          },
          {
            table: item('table'),
            timestamp: item('timestamp'),
            user: r.table('users').get(item('userId')).getField('name'),
            type: item('type'),
            source: r.table('sources')
              .get(item('sourceId'))
              .pluck('brand', 'url', 'isReliable')
              .default({
                brand: '',
                url: '',
                isReliable: false,
              }),
          }
        ))
        .run(conn);
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });


  return router;
};
