const router = require('express').Router();
const exposed = require('./exposed');
const admin = require('./admin');

module.exports = (conn, io) => {
  router.use('/exposed', exposed(conn, io));
  router.use('/admin', admin(conn, io));

  return router;
};
