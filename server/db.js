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
  ];

  try {
    await r.dbCreate(db).run(conn);
    console.log(`${db} database created`);
  } catch (e) {
    console.log(`${db} database has already been created`);
  }

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

  try {
    await r.table('articles').indexCreate('sameDay', (article) => article('timestamp').date()).run(conn);
    console.log('sameDay index created on articles table');
  } catch (e) {
    console.log('sameDay index already exists on articles table');
  }

  // try {
  //   await r.table('sources').indexCreate('url').run(conn);
  //   console.log('url index created on sources table');
  // } catch (e) {
  //   console.log('url index already exists on sources table');
  // }

  cb(conn);
};
