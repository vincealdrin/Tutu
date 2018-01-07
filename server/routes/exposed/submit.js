const router = require('express').Router();
const r = require('rethinkdb');
const rp = require('request-promise');
const cheerio = require('cheerio');
const {
  getDomain,
  cleanUrl,
  getAboutContactUrl,
  getSourceBrand,
  getTitle,
  putHttpUrl,
  PH_TIMEZONE,
} = require('../../utils');

module.exports = (conn, io) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url } = req.query;
      const validUrl = putHttpUrl(url);
      // const domain = getDomain(url);
      // const uuid = await r.uuid(domain).run(conn);
      // const matchedPending = await r.table('pendingSources').get(uuid).run(conn);
      // const matchedSource = await r.table('sources').get(uuid).run(conn);
      // const matchedFakeSource = await r.table('fakeSources').get(uuid).run(conn);

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

      const cheerioDoc = cheerio.load(await rp(validUrl));
      const brand = getSourceBrand(cheerioDoc) || validUrl;
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, validUrl);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const {
        reliable,
        pct,
        sourceUrl,
        sourcePct,
        contentPct,
        socialScore,
        countryRank,
        worldRank,
      } = await rp('http://localhost:5001/predict', {
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
        url: putHttpUrl(sourceUrl),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        isVerified: false,
        brand,
        isReliable,
        hasAboutPage,
        hasContactPage,
        socialScore,
        countryRank,
        worldRank,
      }).run(conn);

      res.json({
        isVerified: false,
        pct,
        sourcePct,
        contentPct,
        isReliable,
        brand,
      });
    } catch (e) {
      next(e);
    }
  });

  router.get('/meta', async (req, res, next) => {
    try {
      const { url } = req.query;
      const cheerioDoc = cheerio.load(await rp(url));
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, url);

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
