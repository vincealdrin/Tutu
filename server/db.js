const r = require('rethinkdb');

module.exports = async (cb) => {
  const db = process.env.DB_NAME;
  const conn = await r.connect({
    db,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  });
  const tables = ['sources', 'articles', 'users', 'siteStats'];

  try {
    await r.dbCreate(db).run(conn);
    console.log(`${db} database created`);
  } catch (e) {
    console.log(`${db} database has already been created`);
  }

  tables.forEach(async (table) => {
    try {
      await r.db(db).tableCreate(table).run(conn);
      console.log(`${table} table created`);
    } catch (e) {
      console.log(`${table} table has already been created`);
    }
  });

  try {
    await r.table('articles').indexCreate(
      'positions',
      r.row('locations')('position'),
      { geo: true, multi: true }
    ).run(conn);
    console.log('positions index created on articles table');
  } catch (e) {
    console.log('positions index already exists on articles table');
  }

  // try {
  //   await r.table('sources').indexCreate('url').run(conn);
  //   console.log('url index created on sources table');
  // } catch (e) {
  //   console.log('url index already exists on sources table');
  // }


  cb(conn);
};
