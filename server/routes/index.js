const router = require('express').Router();
const api = require('./api');
const exposed = require('./exposed');

module.exports = (conn) => {
  router.use('/api', api(conn));
  router.use('/exposed', exposed(conn));

  return router;
};
