const router = require('express').Router();
const articles = require('./articles');

module.exports = (conn, io) => {
  router.use('/articles', articles(conn, io));

  return router;
};
