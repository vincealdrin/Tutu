const router = require('express').Router();
const articles = require('./articles');
const suggestions = require('./suggestions');

module.exports = (conn, io) => {
  router.use('/articles', articles(conn, io));
  router.use('/suggestions', suggestions(conn, io));

  return router;
};
