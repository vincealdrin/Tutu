const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tblName = 'articles';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 20 } = req.query;

    try {
      const table = r.table(tblName);
      const totalArticlesCount = await table.count().run(conn);
      const cursor = await table
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const articles = await cursor.toArray();

      res.setHeader('X-Total-Articles-Count', totalArticlesCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:articleId', async (req, res, next) => {
    const { articleId } = req.params;

    try {
      const article = await r.table(tblName).get(articleId).run(conn);

      return res.json(article);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const articles = req.body.map((article) => ({
      ...articles,
      id: r.uuid(article.url).run(conn),
    }));

    try {
      const { generated_keys } = await r.table(tblName).insert(articles).run(conn);

      return res.json(generated_keys);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:articleId', async (req, res, next) => {
    const { articleId } = req.params;
    const { isIdChanged } = req.query;
    const article = req.body;

    if (isIdChanged) {
      article.id = r.uuid(article.url).run(conn);
    }

    try {
      await r.table(tblName).get(articleId).update(article).run(conn);

      res.json(article);
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

  router.delete('/:articleId', async (req, res, next) => {
    const { articleId = '' } = req.params;

    try {
      await r.table(tblName).getAll(articleId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
