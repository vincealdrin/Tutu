const router = require('express').Router();
const api = require('./api');

module.exports = (conn) => {
  router.use('/api', api(conn));

  return router;
};
