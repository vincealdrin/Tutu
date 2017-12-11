const router = require('express').Router();
const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

module.exports = (conn, io) => {
  const tblName = 'users';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      filter,
      search,
    } = req.query;

    try {
      const table = r.table(tblName);
      const totalCount = await table.count().run(conn);

      if (filter && search) {
        table.filter({ [filter]: search });
      }

      const cursor = await table
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const users = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      res.json(users);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:userId', async (req, res, next) => {
    const { userId } = req.params;

    try {
      const user = await r.table(tblName).get(userId).run(conn);

      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const user = req.body;
    const id = await r.uuid(user.username).run(conn);

    bcrypt.hash(user.password, null, null, async (err, hash) => {
      if (err) throw err;

      user.id = id;
      user.password = hash;

      try {
        await r.table(tblName).insert(user).run(conn);

        res.json(user);
      } catch (e) {
        next(e);
      }
    });
  });

  router.put('/:userId', async (req, res, next) => {
    const { userId } = req.params;
    const { isIdChanged } = req.query;
    const user = req.body;

    if (isIdChanged) {
      user.id = await r.uuid(user.username).run(conn);
    }

    try {
      await r.table(tblName).get(userId).update(user).run(conn);

      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = [] } = req.body;

    try {
      await r.table(tblName).getAll(r.args(ids)).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:userId', async (req, res, next) => {
    const { userId = '' } = req.params;

    try {
      await r.table(tblName).getAll(userId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
