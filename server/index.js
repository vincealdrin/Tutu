require('dotenv').config();
const express = require('express');
const socketIo = require('socket.io');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('passport');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const errorhandler = require('errorhandler');
const cors = require('cors');
const initDb = require('./db');
const exposedRoutes = require('./routes/exposed');
const adminRoutes = require('./routes/admin');
const { startIoClient, startIoAdmin } = require('./socket-server');

const app = express();
const adminApp = express();
const server = http.Server(app);
const io = socketIo(server);
const ioClient = io.of('/client');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression({
  level: 9,
  memLevel: 9,
}));

app.use(cors({ exposedHeaders: 'X-Total-Count' }));

app.use(express.static(path.resolve(__dirname, '..', 'app', 'client', 'build')));
adminApp.use(express.static(path.resolve(__dirname, '..', 'app', 'admin', 'build')));

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(errorhandler());
}

initDb((conn) => {
  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} has connected`);
  });

  ioClient.on('connection', (socket) => {
    // console.log(`${socket.id} has connected`);
  });

  startIoAdmin(io, conn);
  startIoClient(ioClient, conn);

  app.use('/api', exposedRoutes(conn, io));
  adminApp.use('/api', adminRoutes(conn, io));

  // always return the main index.html, so react-router render the route in the client
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'app', 'client', 'build', 'index.html'));
  });

  adminApp.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'app', 'admin', 'build', 'index.html'));
  });

  // catch 404 and forward to error handler
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
        msg: err.msg,
        error: {
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
      msg: err.msg,
    });
  });

  const PORT = process.env.PORT || 3000;
  const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

  server.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
  });

  adminApp.listen(ADMIN_PORT, () => {
    console.log(`admin app served at port ${ADMIN_PORT}`);
  });
});
