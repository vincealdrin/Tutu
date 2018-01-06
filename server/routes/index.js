const router = require('express').Router();
const passport = require('passport');
const exposed = require('./exposed');
const admin = require('./admin');
const auth = require('./auth');
const passportConfig = require('./auth/config');

module.exports = (conn, io) => {
  passportConfig(conn);

  router.use('/exposed', exposed(conn, io));
  router.use('/admin', passport.authenticate('jwt', { session: false }), admin(conn, io));
  router.use('/auth', auth(conn));

  return router;
};
