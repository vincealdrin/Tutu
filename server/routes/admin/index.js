const router = require('express').Router();
const sources = require('./sources');
const pendingSources = require('./pendingSources');
const fakeSources = require('./fakeSources');
const articles = require('./articles');
const users = require('./users');
const usersFeed = require('./usersFeed');
const crawler = require('./crawler');


module.exports = (conn, io) => {
  router.use('/sources', sources(conn, io));
  router.use('/pendingSources', pendingSources(conn, io));
  router.use('/fakeSources', fakeSources(conn, io));
  router.use('/articles', articles(conn, io));
  router.use('/users', users(conn, io));
  router.use('/usersFeed', usersFeed(conn, io));
  router.use('/crawler', crawler(conn, io));

  return router;
};
