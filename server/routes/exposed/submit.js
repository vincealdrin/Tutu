const router = require('express').Router();
const r = require('rethinkdb');
const rp = require('request-promise');
const cheerio = require('cheerio');
const requestIp = require('request-ip');
const {
  cleanUrl,
  getAboutContactUrl,
  getSourceBrand,
  getTitle,
  getFaviconUrl,
  PH_TIMEZONE,
  getDomainOnly,
  cloudScrape,
  removeUrlPath,
} = require('../../utils');

module.exports = (conn, io) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url } = req.query;
      const validUrl = cleanUrl(url);
      const domain = removeUrlPath(url);
      const uuid = await r.uuid(domain).run(conn);
      // const matchedPending = await r.table('pendingSources').get(uuid).run(conn);
      const matchedSource = await r.table('sources').get(uuid).run(conn);
      console.log(matchedSource);
      // if (matchedPending) {
      //   return res.json({
      //     isReliable: matchedPending.isReliable,
      //     isVerified: false,
      //   });
      // }

      if (matchedSource) {
        return res.json({
          isReliable: matchedSource.isReliable,
          isVerified: true,
        });
      }
      let body;

      try {
        body = await rp(validUrl);
      } catch (e) {
        body = await cloudScrape(validUrl);
      }

      const cheerioDoc = cheerio.load(body);
      const brand = getSourceBrand(cheerioDoc) || getDomainOnly(validUrl);
      const title = getTitle(cheerioDoc);
      const faviconUrl = getFaviconUrl(cheerioDoc, validUrl);
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
        overallPred,
      } = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: (hasAboutPage && aboutUsUrl) ? 1 : 0,
          sourceHasContactPage: (hasContactPage && contactUsUrl) ? 1 : 0,
          url: validUrl,
          body,
        },
        json: true,
      });
      const isReliablePred = Boolean(overallPred);
      const ipAddress = requestIp.getClientIp(req);
      const id = await r.uuid(sourceUrl).run(conn);

      await r.table('pendingSources').insert({
        url: cleanUrl(sourceUrl),
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        senderIpAddresses: [ipAddress],
        id,
        brand,
        isReliablePred,
        aboutUsUrl,
        contactUsUrl,
        socialScore,
        countryRank,
        worldRank,
        faviconUrl,
        title,
      }, { conflict: 'update' }).run(conn);

      await r.table('pendingSources').get(id).update({
        sendersIpAddress: r.branch(
          r.row('sendersIpAddress').contains(ipAddress),
          r.row('sendersIpAddress'),
          r.row('sendersIpAddress').append(ipAddress)
        ),
      }).run(conn);

      res.json({
        isVerified: false,
        isReliable: Boolean(reliable),
        pct,
        sourcePct,
        contentPct,
        brand,
        overallPred,
      });
    } catch (e) {
      next({
        status: e.statusCode,
        message: e.error || e.message,
      });
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
