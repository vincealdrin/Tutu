const r = require('rethinkdb');

module.exports = async (cb) => {
  const db = process.env.DB_NAME;
  const conn = await r.connect({
    db,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  });
  const tables = [
    'sources',
    'articles',
    'users',
    'siteStats',
    'fakeSources',
    'pendingSources',
    'locations',
    'provinces',
    'crawlerLogs',
  ];

  r.dbCreate(db).run(conn, async (err) => {
    if (err) console.log(`${db} database has already been created`);

    console.log(`${db} database created`);

    tables.forEach(async (name) => {
      try {
        await r.db(db).tableCreate(name).run(conn);
        console.log(`${name} table created`);
      } catch (e) {
        console.log(`${name} table has already been created`);
      }
    });

    try {
      await r.table('articles').indexCreate(
        'positions',
        r.row('locations')('location')('position'),
        { geo: true, multi: true }
      ).run(conn);
      console.log('positions index created on articles table');
    } catch (e) {
      console.log('positions index already exists on articles table');
    }

    // try {
    //   await r.table('articles').indexCreate('thisWeek', (article) => article('timestamp').date()).run(conn);
    //   console.log('thisWeek index created on articles table');
    // } catch (e) {
    //   console.log('thisWeek index already exists on articles table');
    // }

    try {
      await r.table('crawlerLogs').indexCreate('status', (article) => article('timestamp').date()).run(conn);
      console.log('status index created on crawlerLogs table');
    } catch (e) {
      console.log('status index already exists on crawlerLogs table');
    }

    // try {
    //   await r.table('sources').indexCreate('url').run(conn);
    //   console.log('url index created on sources table');
    // } catch (e) {
    //   console.log('url index already exists on sources table');
    // }

    cb(conn);
  });
};
