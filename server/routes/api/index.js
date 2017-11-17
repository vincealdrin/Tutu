const router = require('express').Router();
const sources = require('./sources');
const articles = require('./articles');
const users = require('./users');

module.exports = (conn, io) => {
  router.use('/sources', sources(conn, io));
  router.use('/articles', articles(conn, io));
  router.use('/users', users(conn, io));

  return router;
};
