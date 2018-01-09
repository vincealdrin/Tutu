const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 20 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .orderBy(r.desc('timestamp'))
        .run(conn);
      const articles = await cursor.toArray();

      // const totalCount = await query.count().run(conn);
      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:articleId', async (req, res, next) => {
    const { articleId } = req.params;

    try {
      const article = await r.table(tbl).get(articleId).run(conn);

      return res.json(article);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const articles = req.body.map(async (article) => ({
      ...articles,
      id: await r.uuid(article.url).run(conn),
    }));

    try {
      const { generated_keys } = await r.table(tbl).insert(articles).run(conn);

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
      article.id = await r.uuid(article.url).run(conn);
    }

    try {
      await r.table(tbl).get(articleId).update(article).run(conn);

      res.json(article);
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

  router.delete('/:articleId', async (req, res, next) => {
    const { articleId = '' } = req.params;

    try {
      await r.table(tbl).getAll(articleId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
