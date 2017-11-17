const r = require('rethinkdb');

module.exports = async (cb) => {
  const db = 'tutu';
  const host = 'localhost';
  const port = 28015;
  const conn = await r.connect({ db, host, port });

  try {
    await r.dbCreate('tutu').run(conn);
    await r.db(db).tableCreate('sources').run(conn);
    await r.db(db).tableCreate('articles').run(conn);

    await r.table('articles').indexCreate('positions', r.row('locations')('position'), { geo: true, multi: true }).run(conn);


    console.log('Database and tables created');
  } catch (e) {
    console.log('Database and tables already created');
  }

  cb(conn);
};
