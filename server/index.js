const express = require('express');
const socketIo = require('socket.io');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('passport');
const bodyParser = require('body-parser');
const http = require('http');
const errorhandler = require('errorhandler');
const initDb = require('./db');
const routes = require('./routes');
const r = require('rethinkdb');

require('dotenv').config();

const app = express();
const server = http.Server(app);
const io = socketIo(server);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression({
  level: 9,
  memLevel: 9,
}));


const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(errorhandler());
}

initDb((conn) => {
  io.sockets.on('connection', (socket) => {
    r.table('articles').changes().run(conn, (err, cursor) => {
      if (err) throw err;

      socket.emit('new_articles', cursor.toArray());
    });

    r.table('sources').changes().run(conn, (err, cursor) => {
      if (err) throw err;

      socket.emit('new_sources', cursor.toArray());
    });

    app.use(routes(conn, socket));
  });

  // / catch 404 and forward to error handler
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (!isProduction) {
    app.use((err, req, res, next) => {
      console.log(err.stack);

      res.status(err.status || 500);

      res.json({
        errors: {
          message: err.message,
          error: err,
        },
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
  });
});
