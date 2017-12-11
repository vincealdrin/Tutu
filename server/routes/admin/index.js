const router = require('express').Router();
const sources = require('./sources');
const articles = require('./articles');
const users = require('./users');
const crawler = require('./crawler');

module.exports = (conn, io) => {
  router.use('/sources', sources(conn, io));
  router.use('/articles', articles(conn, io));
  router.use('/users', users(conn, io));
  router.use('/crawler', crawler(conn, io));

  return router;
};
