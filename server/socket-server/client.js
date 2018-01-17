const r = require('rethinkdb');
const { mapFeedArticle, PH_TIMEZONE } = require('../utils');

module.exports = (io, conn) => {
  io.on('connection', async (socket) => {
    const ip = socket.handshake.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
    const userAgent = socket.request.headers['user-agent'];
    const id = await r.uuid(ip);
    const matchedVisitor = await r.table('visitors').get(id).run(conn);

    if (!matchedVisitor) {
      await r.table('visitors').insert({
        id,
        ipAddress: ip,
        userAgents: [userAgent],
        lastVisit: r.now().inTimezone(PH_TIMEZONE),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
      }).run(conn);
    }

    if (matchedVisitor) {
      await r.table('visitors').get(id).update({
        userAgents: r.branch(
          r.row('userAgents').contains(userAgent),
          r.row('userAgents'),
          r.row('userAgents').append(userAgent)
        ),
        lastVisit: r.now().inTimezone(PH_TIMEZONE),
      }).run(conn);
    }
  });


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
