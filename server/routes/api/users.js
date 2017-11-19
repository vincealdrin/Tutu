const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'users';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const users = await cursor.toArray();

      return res.json(users);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:userId', async (req, res, next) => {
    const { userId } = req.params;

    try {
      const user = await r.table(tbl).get(userId).run(conn);

      return res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const user = req.body;
    const id = r.uuid(user.username);
    const newUser = { ...user, id };

    try {
      await r.table(tbl).insert(newUser).run(conn);

      return res.json(id);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:userId', async (req, res, next) => {
    const { userId } = req.params;
    const { isIdChanged } = req.query;
    const user = req.body;

    if (isIdChanged) {
      user.id = r.uuid(user.username);
    }

    try {
      await r.table(tbl).get(userId).update(user).run(conn);

      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = [] } = req.body;

    try {
      await r.table(tbl).getAll(r.args(ids)).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:userId', async (req, res, next) => {
    const { userId = '' } = req.params;

    try {
      await r.table(tbl).getAll(userId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
