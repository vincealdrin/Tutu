const router = require('express').Router();
const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

module.exports = (conn, io) => {
  const tbl = 'users';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      filter = '',
      search = '',
    } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    try {
      let query = r.table(tbl).filter(r.row('role').ne('superadmin'));

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const totalCount = await query.count().run(conn);
      const cursor = await query
        .orderBy(r.desc('timestamp'))
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
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
      const user = await r.table(tbl).get(userId).run(conn);

      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const user = req.body;
    const id = await r.uuid(user.username).run(conn);

    const matchedUser = await r.table(tbl).get(id).run(conn);

    if (matchedUser) {
      return next({
        message: 'User already exists with the same username',
        status: 400,
      });
    }

    if (user.role === 'superadmin') {
      return next({
        message: 'Can\'t create user with superadmin role',
        status: 400,
      });
    }

    user.role = 'curator';

    bcrypt.hash(user.password, null, null, async (err, hash) => {
      if (err) throw err;

      user.id = id;
      user.password = hash;

      try {
        await r.table(tbl).insert(user).run(conn);

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
      await r.table(tbl).get(userId).update(user).run(conn);

      res.json(user);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = [] } = req.body;

    try {
      await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .filter(r.row('role').ne('superadmin'))
        .delete()
        .run(conn);

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
