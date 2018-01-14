const { getDomainCreationDate } = require('./utils');
const r = require('rethinkdb');

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

(async () => {
  try {
    const conn = await r.connect({
      db: 'tutu',

    });

    const cursor = await r.table('sources').run(conn);
    const a = await cursor.toArray();

    // a.forEach(async (ar) => {
    //   console.log(ar.id);
    //   r.table('sources').get(ar.id).update({
    //     domainCreationDate: await getDomainCreationDate(ar.url),
    //   });
    //   await sleep();
    // });
    console.log(a[34]);
    console.log(await getDomainCreationDate(a[34].url));
  } catch (e) {
    console.log(e);
  }
})();
