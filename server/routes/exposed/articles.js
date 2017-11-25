const router = require('express').Router();
const r = require('rethinkdb');

module.exports = (conn, io) => {
  const tbl = 'articles';

  router.get('/', async (req, res, next) => {
    const {
      neLng,
      neLat,
      nwLng,
      nwLat,
      seLng,
      seLat,
      swLng,
      swLat,
      limit = 15,
    } = req.query;
    const bounds = r.polygon(
      [parseFloat(swLng), parseFloat(swLat)],
      [parseFloat(seLng), parseFloat(seLat)],
      [parseFloat(neLng), parseFloat(neLat)],
      [parseFloat(nwLng), parseFloat(nwLat)],
    );

    const params = {
      index: 'positions',
      // maxResults: parseInt(limit),
    };

    try {
      const totalCount = await r.table(tbl).count().run(conn);
      const cursor = await r.table(tbl)
        .getIntersecting(bounds, params)
        .eqJoin(r.row('sourceId'), r.table('sources'))
        .map((doc) => ({
          url: doc('left')('url'),
          title: doc('left')('title'),
          authors: doc('left')('authors'),
          keywords: doc('left')('keywords'),
          publishDate: doc('left')('publishDate'),
          sentiment: doc('left')('sentiment'),
          summary: doc('left')('summary'),
          summary2: doc('left')('summary2'),
          topImage: doc('left')('topImage'),
          categories: doc('left')('categories').filter((category) => category('score').gt(0)),
          locations: doc('left')('locations')
            .filter((loc) => bounds.intersects(loc('location')('position')))
            .map((loc) => loc('location')('position').toGeojson()('coordinates')),
          source: {
            url: doc('right')('contentData')('dataUrl'),
            title: doc('right')('contentData')('siteData')('title'),
            description: doc('right')('contentData')('siteData')('description'),
            aboutUsUrl: doc('right')('aboutUsUrl'),
            contactUsUrl: doc('right')('contactUsUrl'),
            relatedLinks: doc('right')('related')('relatedLinks')('relatedLink'),
          },
        }))
        .run(conn);
      const articles = await cursor.toArray();

      res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  router.get('/recent', async (req, res, next) => {
    try {
      // const totalCount = await r.table(tbl).count().run(conn);
      const cursor = await r.table(tbl).getAll(r.now()).run(conn);
      const articles = await cursor.toArray();

      // res.setHeader('X-Total-Count', totalCount);
      return res.json(articles);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
