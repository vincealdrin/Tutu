const router = require('express').Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

const extractUserInfo = ({
  id,
  username,
  name,
  role,
}) => ({
  id,
  username,
  name,
  role,
});
const { JWT_SECRET } = process.env;
const generateToken = (user) => jwt.sign(extractUserInfo(user), JWT_SECRET, {
  expiresIn: '3 days',
  issuer: 'TUTU',
});

module.exports = (conn) => {
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) next(err);

      if (!user) {
        return res.status(400).json({
          message: info.message,
        });
      }

      res.json({
        token: `JWT ${generateToken(user)}`,
        user: extractUserInfo(user),
      });
    })(req, res, next);
  });

  router.post('/register', (req, res, next) => {
    const {
      username,
      password,
      name,
      role,
    } = req.body;

    bcrypt.hash(password, null, null, async (err, hashedPassword) => {
      if (err) next(err);

      try {
        await r.table('users').insert({
          id: await r.uuid(username).run(conn),
          password: hashedPassword,
          username,
          name,
          role,
        }).run(conn);

        res.status(204).send();
      } catch (e) {
        next(e);
      }
    });
  });

  return router;
};
