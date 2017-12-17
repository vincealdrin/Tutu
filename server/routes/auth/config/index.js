const passport = require('passport');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const LocalStrategy = require('passport-local');
const r = require('rethinkdb');
const bcrypt = require('bcrypt-nodejs');

const jwtOption = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey: process.env.JWT_SECRET,
  issuer: 'TUTU',
  audience: 'TUTU Admin',
};

module.exports = (conn) => {
  const tbl = 'users';

  const localLogin = new LocalStrategy(async (username, password, done) => {
    try {
      const id = await r.uuid(username).run(conn);
      const matchedUser = await r.table(tbl).get(id).run(conn);

      if (!matchedUser) {
        return done(null, false, { message: 'User not found' });
      }

      bcrypt.compare(password, matchedUser.password, (err, isMatch) => {
        if (err) done(err);

        if (!isMatch) {
          return done(null, false, { message: 'Invalid password' });
        }

        done(null, matchedUser);
      });
    } catch (e) {
      done(e);
    }
  });

  const jwtAuth = new JWTStrategy(jwtOption, async ({ username }, done) => {
    const matchedUser = await r.table(tbl).get(username).run(conn);

    if (!matchedUser) {
      return done(null, false, { message: 'Invalid token' });
    }

    done(null, matchedUser);
  });

  passport.use(localLogin);
  passport.use(jwtAuth);
};

