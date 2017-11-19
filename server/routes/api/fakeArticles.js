const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'fakeArticles';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const fakeArticles = await cursor.toArray();

      return res.json(fakeArticles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:fakeArticleId', async (req, res) => {
    const { fakeArticleId } = req.params;

    try {
      const fakeArticle = await r.table(tbl).get(fakeArticleId).run(conn);

      return res.json(fakeArticle);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res) => {
    const fakeArticles = req.body;

    try {
      const { generated_keys } = await r.table(tbl).insert(fakeArticles).run(conn);

      return res.json(generated_keys);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:fakeArticleId', async (req, res) => {
    const { fakeArticleId } = req.params;
    const fakeArticle = req.body;

    try {
      await r.table(tbl).get(fakeArticleId).update(fakeArticle).run(conn);

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

  router.delete('/:fakeArticleId', async (req, res) => {
    const { fakeArticleId = '' } = req.params;

    try {
      await r.table(tbl).getAll(fakeArticleId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
