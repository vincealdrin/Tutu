const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

const {
  DB_NAME,
  DB_HOST,
  DB_PORT,
  SUPERADMIN_USERNAME,
  SUPERADMIN_PASS,
  SUPERADMIN_ROLE,
  SUPERADMIN_NAME,
} = process.env;

module.exports = async (cb) => {
  try {
    const conn = await r.connect({
      db: DB_NAME,
      host: DB_HOST,
      port: DB_PORT,
    });

    const tables = [
      'sources',
      'articles',
      'users',
      'siteStats',
      'fakeArticles',
      'pendingSources',
      'locations',
      'provinces',
      'crawlerLogs',
      'usersFeed',
      'visitors',
      'errorArticles',
      // 'errorSources',
    ];

    r.dbCreate(DB_NAME).run(conn, async (err) => {
      if (err) console.log(`${DB_NAME} database has already been created`);

      console.log(`${DB_NAME} database created`);

      tables.forEach(async (name) => {
        try {
          await r.db(DB_NAME).tableCreate(name).run(conn);
          console.log(`${name} table created`);
        } catch (e) {
          console.log(`${name} table has already been created`);
        }
      });

      bcrypt.hash(SUPERADMIN_PASS, null, null, async (hashErr, hashedPassword) => {
        if (hashErr) console.log(hashErr);

        try {
          await r.table('users').wait().run(conn);
          await r.table('users').insert({
            id: await r.uuid(SUPERADMIN_USERNAME).run(conn),
            password: hashedPassword,
            username: SUPERADMIN_USERNAME,
            name: SUPERADMIN_NAME,
            role: SUPERADMIN_ROLE,
          }).run(conn);
        } catch (e) {
          console.log(e);
        }
      });

      try {
        await r.table('articles').wait();
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
        await r.table('articles').wait();
        await r.table('articles').indexCreate('locationPublishDate', (article) => [
          article('locations')('location')('position'),
          article('publishDate'),
        ], { geo: true, multi: true }).run(conn);
        console.log('locationPublishDate index created on articles table');
      } catch (e) {
        console.log('locationPublishDate index already exists on articles table');
      }

      try {
        await r.table('articles').wait();
        await r.table('articles').indexCreate('popularityScore', r.row('popularity')('totalScore')).run(conn);
        console.log('popularityScore index created on articles table');
      } catch (e) {
        console.log('popularityScore index already exists on articles table');
      }

      try {
        await r.table('articles').wait();
        await r.table('articles').indexCreate('timestamp', r.row('timestamp')).run(conn);
        console.log('timestamp index created on articles table');
      } catch (e) {
        console.log('timestamp index already exists on articles table');
      }

      try {
        await r.table('crawlerLogs').wait();
        await r.table('crawlerLogs')
          .indexCreate('status', (article) => article('timestamp').date())
          .run(conn);
        console.log('status index created on crawlerLogs table');
      } catch (e) {
        console.log('status index already exists on crawlerLogs table');
      }

      cb(conn);
    });
  } catch (e) {
    console.log(e);
  }
};
