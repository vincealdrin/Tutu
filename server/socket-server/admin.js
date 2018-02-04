const r = require('rethinkdb');
const { mapFeedLog } = require('../utils');

module.exports = (io, conn) => {
  const date = new Date();
  date.setDate(date.getDate() - 7);

  r.table('sources')
    .changes({ includeTypes: true })
    .run(conn, (err, cursor) => {
      if (err) throw err;

      cursor.each((e, feed) => {
        if (e) throw e;
        if (feed.type === 'add') {
          io.emit('newSource');
        }
      });
    });

  r.table('pendingSources')
    .changes({ includeTypes: true })
    .run(conn, (err, cursor) => {
      if (err) throw err;

      cursor.each((e, feed) => {
        if (e) throw e;
        if (feed.type === 'add') {
          io.emit('newPendingSource');
        }
      });
    });

  r.table('articles')
    .changes({ includeTypes: true })
    .run(conn, (err, cursor) => {
      if (err) throw err;

      cursor.each((e, feed) => {
        if (e) throw e;
        if (feed.type === 'add') {
          io.emit('newArticle');
        }
      });
    });

  r.table('users').changes().run(conn, (err, cursor) => {
    if (err) throw err;

    cursor.each((e, user) => {
      if (e) throw e;
      io.emit('newUsers', user);
    });
  });

  r.table('crawlerLogs')
    .changes({ includeTypes: true })
    .filter(r.row('new_val')('timestamp').date().ge(date))
    .eqJoin(r.row('new_val')('sourceId'), r.table('sources'))
    .map(mapFeedLog)
    .run(conn, (err, cursor) => {
      if (err) throw err;

      cursor.each((e, feed) => {
        if (e) throw e;
        if (feed.type === 'add') {
          io.emit('crawlLog', feed.log);
        }
      });
    });
};
