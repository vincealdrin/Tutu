
const router = require('express').Router();
const rp = require('request-promise');
const { getAboutContactUrl } = require('../../utils');

module.exports = (conn) => {
  router.get('/', async (req, res, next) => {
    try {
      const { url } = req.query;
      const htmlDoc = await rp(url);
      const { aboutUsUrl, contactUsUrl } = getAboutContactUrl(htmlDoc, url);
      console.log(aboutUsUrl);
      console.log(contactUsUrl);
      const hasAboutPage = !/^https?:\/\/#?$/.test(aboutUsUrl);
      const hasContactPage = !/^https?:\/\/#?$/.test(contactUsUrl);

      const result = await rp('http://localhost:5001/predict', {
        method: 'POST',
        body: {
          sourceHasAboutPage: (hasAboutPage && aboutUsUrl) ? 1 : 0,
          sourceHasContactPage: (hasContactPage && contactUsUrl) ? 1 : 0,
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
