const router = require('express').Router();
const r = require('rethinkdb');
const rp = require('request-promise');
const cheerio = require('cheerio');
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
  getWotReputation,
} = require('../../utils');

module.exports = (conn, io) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url, submit = 'yes' } = req.query;
      const domain = cleanUrl(removeUrlPath(url));
      const uuid = await r.uuid(domain).run(conn);
      console.log(domain);
      console.log(uuid);
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
          sourceUrl: matchedSource.url,
          isVerified: true,
        });
      }

      let body;
      try {
        body = await rp(url);
      } catch (e) {
        try {
          body = await cloudScrape(url);
        } catch (err) {
          return next({
            status: 500,
            message: 'Can\'t access the article url, please try again later',
          });
        }
      }

      const cheerioDoc = cheerio.load(body);
      const brand = getSourceBrand(cheerioDoc) || getDomainOnly(url);
      const title = getTitle(cheerioDoc);
      const faviconUrl = getFaviconUrl(cheerioDoc, url);
      const wotReputation = await getWotReputation(url);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, url);
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
          url,
          body,
        },
        json: true,
      });
      const isReliablePred = Boolean(reliable);
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const cleanedSrcUrl = cleanUrl(sourceUrl);
      const id = await r.uuid(cleanedSrcUrl).run(conn);
      console.log('after');
      console.log(cleanedSrcUrl);
      console.log(id);
      await r.table('pendingSources').insert({
        url: cleanedSrcUrl,
        timestamp: r.now().inTimezone(PH_TIMEZONE),
        senderIpAddress: ipAddress,
        id,
        wotReputation,
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

      if (submit === 'yes') {
        await r.table('pendingSources').get(id).update({
          sendersIpAddress: r.branch(
            r.row('sendersIpAddress').contains(ipAddress),
            r.row('sendersIpAddress'),
            r.row('sendersIpAddress').append(ipAddress)
          ),
        }).run(conn);
      }

      res.json({
        sourceUrl: cleanedSrcUrl,
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
      try {
        const cheerioDoc = cheerio.load(await rp(url));
        const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(cheerioDoc, url);

        res.json({
          aboutUsUrl,
          contactUsUrl,
        });
      } catch (e) {
        return res.json({
          aboutUsUrl: '',
          contactUsUrl: '',
        });
      }
    } catch (e) {
      next(e);
    }
  });

  return router;
};
