const router = require('express').Router();
const sources = require('./sources');
const pendingSources = require('./pendingSources');
const articles = require('./articles');
const users = require('./users');
const usersFeed = require('./usersFeed');
const crawler = require('./crawler');
const dashboard = require('./dashboard');

module.exports = (conn, socket) => {
  router.use('/sources', sources(conn, socket));
  router.use('/pendingSources', pendingSources(conn, socket));
  router.use('/articles', articles(conn, socket));
  router.use('/users', users(conn, socket));
  router.use('/usersFeed', usersFeed(conn, socket));
  router.use('/crawler', crawler(conn, socket));
  router.use('/dashboard', dashboard(conn, socket));

  return router;
};
