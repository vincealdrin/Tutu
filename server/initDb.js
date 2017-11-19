require('dotenv').config();

const r = require('rethinkdb');

(async () => {
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
    'fakeArticles',
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
      'locations',
      r.row('locations')('coordinates'),
      { geo: true, multi: true }
    ).run(conn);
    console.log('locations index created on articles table');
  } catch (e) {
    console.log('locations index already exists on articles table');
  }
})();
