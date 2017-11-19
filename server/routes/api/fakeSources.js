const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'fakeSources';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const fakeSources = await cursor.toArray();

      return res.json(fakeSources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:fakeSourceId', async (req, res) => {
    const { fakeSourceId } = req.params;

    try {
      const fakeSource = await r.table(tbl).get(fakeSourceId).run(conn);

      return res.json(fakeSource);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res) => {
    const fakeSources = req.body;

    try {
      const { generated_keys } = await r.table(tbl).insert(fakeSources).run(conn);

      return res.json(generated_keys);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:fakeSourceId', async (req, res) => {
    const { fakeSourceId } = req.params;
    const fakeSource = req.body;

    try {
      await r.table(tbl).get(fakeSourceId).update(fakeSource).run(conn);

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

  router.delete('/:fakeSourceId', async (req, res) => {
    const { fakeSourceId = '' } = req.params;

    try {
      await r.table(tbl).getAll(fakeSourceId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
