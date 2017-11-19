const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      page = 0,
      limit = 15,
      lng = 0,
      lat = 0,
      maxDist = 100,
    } = req.query;
    const point = r.point(parseFloat(lng), parseFloat(lat));
    const articlesArea = {
      index: 'positions',
      maxDist: parseFloat(maxDist),
      unit: 'km',
    };

    try {
      const articles = await r.table('articles')
        .getNearest(point, articlesArea)
        .eqJoin(r.row('source_id'), r.table('sources'))
        .skip(page * limit)
        .limit(limit)
        .zip()
        .run(conn);

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
    const articles = req.body.map((article) => ({
      ...articles,
      id: r.uuid(article.url),
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
      article.id = r.uuid(article.url);
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
