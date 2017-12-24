const router = require('express').Router();
const r = require('rethinkdb');
const rp = require('request-promise');
const {
  getAboutContactUrl,
  getDomain,
  cleanUrl,
  putHttpUrl,
} = require('../../utils');

module.exports = (conn, io) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url } = req.query;
      const validUrl = putHttpUrl(url);
      const domain = getDomain(url);
      const uuid = await r.uuid(domain).run(conn);
      const matchedPending = await r.table('pendingSources').get(uuid).run(conn);
      const matchedSource = await r.table('sources').get(uuid).run(conn);
      const matchedFakeSource = await r.table('fakeSources').get(uuid).run(conn);

      // if (matchedPending) {
      //   return res.json({
      //     isReliable: matchedPending.isReliable,
      //     isVerified: false,
      //   });
      // }

      // if (matchedSource) {
      //   return res.json({
      //     isReliable: true,
      //     isVerified: true,
      //   });
      // }

      // if (matchedFakeSource) {
      //   return res.json({
      //     isReliable: false,
      //     isVerified: true,
      //   });
      // }

      const htmlDoc = await rp(validUrl);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, validUrl);
      console.log(aboutUsUrl);
      console.log(contactUsUrl);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const { reliable, sourceUrl } = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: (hasAboutPage && aboutUsUrl) ? 1 : 0,
          sourceHasContactPage: (hasContactPage && contactUsUrl) ? 1 : 0,
          url: validUrl,
        },
        json: true,
      });
      const isReliable = Boolean(reliable);

      await r.table('pendingSources').insert({
        id: await r.uuid(sourceUrl).run(conn),
        url: sourceUrl,
        timestamp: new Date(),
        isVerified: false,
        isReliable,
      }).run(conn);

      res.json({
        isVerified: false,
        isReliable,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/meta', async (req, res, next) => {
    try {
      const { url } = req.query;
      const htmlDoc = await rp(url);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, url);

      res.json({
        aboutUsUrl,
        contactUsUrl,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
};
