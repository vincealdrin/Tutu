
const router = require('express').Router();
const rp = require('request-promise');
const parseDomain = require('parse-domain');
const { getAboutContactUrl } = require('../../utils');

module.exports = (conn) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url } = req.query;
      const { domain, subdomain, tld } = parseDomain(url);
      // const noPathUrl = `http://${subdomain}.${domain ? `${domain}.` : ''}${tld}`;
      const htmlDoc = await rp(url);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, url);

      const result = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: aboutUsUrl ? 1 : 0,
          sourceHasContactPage: contactUsUrl ? 1 : 0,
          url,
        },
        json: true,
      });


      res.json(result);
    } catch (e) {
      next(e);
    }
  });

  return router;
};
