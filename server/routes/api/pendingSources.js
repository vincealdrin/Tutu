const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'pendingSources';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const pendingSources = await cursor.toArray();

      return res.json(pendingSources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:pendingSourceId', async (req, res) => {
    const { pendingSourceId } = req.params;

    try {
      const pendingSource = await r.table(tbl).get(pendingSourceId).run(conn);

      return res.json(pendingSource);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res) => {
    const pendingSources = req.body;

    try {
      const { generated_keys } = await r.table(tbl).insert(pendingSources).run(conn);

      return res.json(generated_keys);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:pendingSourceId', async (req, res) => {
    const { pendingSourceId } = req.params;
    const pendingSource = req.body;

    try {
      await r.table(tbl).get(pendingSourceId).update(pendingSource).run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res) => {
    const { ids = [] } = req.body;

    try {
      await r.table(tbl).getAll(r.args(ids)).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:pendingSourceId', async (req, res) => {
    const { pendingSourceId = '' } = req.params;

    try {
      await r.table(tbl).getAll(pendingSourceId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
