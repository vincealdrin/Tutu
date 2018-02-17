if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const socketIo = require('socket.io');
const morgan = require('morgan');
const compression = require('compression');
const passport = require('passport');
const bodyParser = require('body-parser');
const Wappalyzer = require('wappalyzer');
const http = require('http');
const errorhandler = require('errorhandler');
const cors = require('cors');
const initDb = require('./db');
const routes = require('./routes');
const { startIoClient, startIoAdmin } = require('./socket-server');
const r = require('rethinkdb');
const { getWotReputation, analyzeDomain, getDomainCreationDate } = require('./utils');

const options = {
  debug: false,
  delay: 500,
  maxDepth: 3,
  maxUrls: 10,
  maxWait: 5000,
  recursive: true,
  userAgent: 'Wappalyzer',
};

// const wappalyzer = new Wappalyzer('http://globalnation.inquirer.net/164127/breaking-china-named-5-undersea-features-ph-rise-expert?utm_campaign=Echobox&utm_medium=Social&utm_source=Facebook#link_time=1518511190', options);

// wappalyzer.analyze()
//   .then((json) => {
//     console.log(json);
//   })
//   .catch((error) => {
//     console.log(error);
//   });

const app = express();
const server = http.Server(app);
const io = socketIo(server);
const ioClient = io.of('/client');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
  limit: '100mb',
  extended: false,
}));
app.use(bodyParser.json({
  limit: '100mb',
}));
app.use(compression({
  level: 9,
  memLevel: 9,
}));
app.use(passport.initialize());

app.use(cors({ exposedHeaders: 'X-Total-Count' }));
app.set('trust proxy', true);
// app.use(express.static(path.resolve(__dirname, '..', 'app', 'client', 'build')));

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  app.use(errorhandler());
}
// function sleep(ms) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
initDb(async (conn) => {
  // const s = await r.table('sources').run(conn);
  // const z = await s.toArray();

  // z.forEach(async ({ id, url }) => {
  //   const domainMeta = analyzeDomain(url);
  //   const domainCreationDate = domainMeta.isBlogDomain ? null : await getDomainCreationDate(url);
  //   const creationDateExpr = domainCreationDate ? new Date(domainCreationDate) : null;

  //   await r.table('sources').get(id).update({
  //     domainCreationDate: creationDateExpr,
  //     // wotReputation: res,
  //     ...domainMeta,
  //   }).run(conn);
  // });

  io.sockets.on('connection', (socket) => {
    console.log(`${socket.id} has connected`);
  });

  startIoAdmin(io, conn);
  startIoClient(ioClient, conn);

  app.use('/api', routes(conn, { io, ioClient }));

  // always return the main index.html, so react-router render the route in the client
  // app.get('*', (req, res) => {
  //   res.sendFile(path.resolve(__dirname, '..', 'app', 'client', 'build', 'index.html'));
  // });


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
        message: err.message,
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
      message: err.message || err.message,
    });
  });

  const PORT = process.env.PORT || 5000;

  server.listen(PORT, () => {
    console.log(`listening at port ${PORT}`);
  });
});
