const router = require('express').Router();
const r = require('rethinkdb');
const awis = require('awis');
const request = require('request');
const cheerio = require('cheerio');

module.exports = (conn, socket) => {
  const tbl = 'sources';

  router.get('/', async (req, res, next) => {
    const { page = 0, limit = 15 } = req.query;

    try {
      const cursor = await r.table(tbl)
        .skip(page * limit)
        .limit(limit)
        .run(conn);
      const sources = await cursor.toArray();

      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:sourceId', async (req, res) => {
    const { sourceId } = req.params;

    try {
      const source = await r.table(tbl).get(sourceId).run(conn);

      return res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res) => {
    const sources = req.body;

    try {
      const { generated_keys } = await r.table(tbl).insert(sources).run(conn);


      return res.json(generated_keys);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:sourceId', async (req, res) => {
    const { sourceId } = req.params;
    const source = req.body;

    try {
      await r.table(tbl).get(sourceId).update(source).run(conn);

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

  router.delete('/:sourceId', async (req, res) => {
    const { sourceId = '' } = req.params;

    try {
      await r.table(tbl).getAll(sourceId).delete().run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  return router;
};
