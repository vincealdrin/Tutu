
const router = require('express').Router();
const rp = require('request-promise');
const { getAboutContactUrl } = require('../../utils');

module.exports = (conn, io) => {
  router.get('/', async (req, res, next) => {
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
