const router = require('express').Router();
const sources = require('./sources');
const articles = require('./articles');
const users = require('./users');

module.exports = (conn, socket) => {
  router.use('/sources', sources(conn, socket));
  router.use('/articles', articles(conn, socket));
  router.use('/users', users(conn, socket));

  return router;
};
