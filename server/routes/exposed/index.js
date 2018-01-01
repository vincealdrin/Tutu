const router = require('express').Router();
const articles = require('./articles');
const suggestions = require('./suggestions');
const submit = require('./submit');
const insights = require('./insights');

module.exports = (conn, io) => {
  router.use('/articles', articles(conn, io));
  router.use('/suggestions', suggestions(conn, io));
  router.use('/submit', submit(conn, io));
  router.use('/insights', insights(conn, io));

  return router;
};
