const router = require('express').Router();
const r = require('rethinkdb');
const { cleanUrl } = require('../../utils');

module.exports = (conn, io) => {
  const tbl = 'fakeSources';

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
    const fakeSources = req.body;
    const timestamp = new Date();

    try {
      const sources = await Promise.all(fakeSources.map(async (source) => {
        const url = cleanUrl(source);
        const uuid = await r.uuid(url).run(conn);

        return {
          id: uuid,
          url,
          timestamp,
        };
      }));
      const uuids = sources.map((source) => source.id);
      const pendingCursor = await r.table('pendingSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedPendings = await pendingCursor.toArray();
      const sourceCursor = await r.table('sources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedSources = await sourceCursor.toArray();
      const fakeCursor = await r.table('fakeSources')
        .getAll(r.args(uuids))
        .pluck('id', 'url')
        .run(conn);
      const matchedFakes = await fakeCursor.toArray();

      if (matchedPendings || matchedSources) {
        const errorMessage = [];

        sources.forEach((source) => {
          const foundFake = matchedFakes.find((mf) => mf.id === source.id);
          if (foundFake) {
            errorMessage.push(`${foundFake.url} already exists in list of reliable sources`);
            return;
          }

          const foundPending = matchedPendings.find((mp) => mp.id === source.id);
          if (foundPending) {
            errorMessage.push(`${foundPending.url} already exists in list of pending sources`);
          }

          const foundSource = matchedSources.find((ms) => ms.id === source.id);
          if (foundSource) {
            errorMessage.push(`${foundSource.url} already exists in list of reliable sources`);
          }
        });

        return next({
          status: 400,
          message: errorMessage.join(','),
        });
      }

      await r.table(tbl).insert(sources).run(conn);
      return res.json(sources);
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
