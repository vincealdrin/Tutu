const r = require('rethinkdb');
const { mapFeedArticle } = require('../utils');

module.exports = (io, conn) => {
  r.table('articles')
    .changes({ includeTypes: true })
    .eqJoin(r.row('new_val')('sourceId'), r.table('sources'))
    .map(mapFeedArticle)
    .run(conn, (err, cursor) => {
      if (err) throw err;

      cursor.each((e, feed) => {
        if (e) throw e;

        if (feed.type === 'add') {
          io.emit('newArticle', feed.article);
        }
      });
    });
};
