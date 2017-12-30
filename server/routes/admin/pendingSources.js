const router = require('express').Router();
const r = require('rethinkdb');
const { cleanUrl } = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'pendingSources';

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
      const totalCount = await r.table(tbl).count().run(conn);
      let query = r.table(tbl);

      if (filter && search) {
        query = query.filter((source) => source(filter).match(`(?i)${search}`));
      }

      const cursor = await query
        .slice(parsedPage * parsedLimit, (parsedPage + 1) * parsedLimit)
        .run(conn);
      const sources = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(sources);
    } catch (e) {
      next(e);
    }
  });

  router.get('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;

    try {
      const source = await r.table(tbl).get(sourceId).run(conn);

      return res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.post('/', async (req, res, next) => {
    const pendingSource = req.body;
    const timestamp = new Date();
    const url = cleanUrl(pendingSource.url);

    try {
      const uuid = await r.uuid(url).run(conn);
      const matchedPending = await r.table('pendingSources').get(uuid).run(conn);
      const matchedSource = await r.table('sources').get(uuid).run(conn);
      const matchedFakeSource = await r.table('fakeSources').get(uuid).run(conn);

      if (matchedPending) {
        return next({
          status: 400,
          message: 'Source is already in list of pending sources',
        });
      }

      if (matchedSource) {
        return next({
          status: 400,
          message: 'Source is already in list of reliable sources',
        });
      }

      if (matchedFakeSource) {
        return next({
          status: 400,
          message: 'Source is already in list of fake sources',
        });
      }

      const pendingSourceInfo = {
        ...pendingSource,
        id: await r.uuid(url).run(conn),
        timestamp,
      };
      await r.table(tbl).insert(pendingSourceInfo).run(conn);

      return res.json(pendingSourceInfo);
    } catch (e) {
      next(e);
    }
  });

  router.put('/:sourceId', async (req, res, next) => {
    const { sourceId } = req.params;
    const { isIdChanged } = req.query;
    const source = req.body;

    if (isIdChanged) {
      source.id = await r.uuid(source.url).run(conn);
    }

    try {
      await r.table(tbl).get(sourceId).update(source).run(conn);

      res.json(source);
    } catch (e) {
      next(e);
    }
  });

  router.delete('/', async (req, res, next) => {
    const { ids = '' } = req.body;

    try {
      await r.table(tbl)
        .getAll(r.args(ids.split(',')))
        .delete()
        .run(conn);

      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });

  router.delete('/:sourceId', async (req, res, next) => {
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
