'use strict';

const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const Koa = require('koa');

const Pug = require('koa-pug');
const koaBody = require('koa-body');
const serveStatic = require('koa-static');
const convert = require('koa-convert');
const csrf = require('koa-csrf');
const validate = require('koa-validate');

const service = require('./service/index.js');
const session = require('./lib/getToken');
const middleware = require('./lib/middleware');
const config = require('./setting.js');
const router = require('./controller')(config);
const db = require('./lib/db');

const app = new Koa();
const pug = new Pug(config.view);

const { port, host, keys } = config;
const state = config.state || 'web';

//init config
app.proxy = true;
app.keys = keys;

// pug template
pug.use(app);
// service
service(app);
// validate
validate(app);

// X-Response-Time
app.use(middleware.responseTime);

// livereload
if (config.debug) {
  app.use(require('koa-livereload')());
}

// session
app.use(convert(session(config.session)));

// last request time
app.use(middleware.lastRequstTime);

app.use(middleware.addError);
app.use(middleware.dumpJSON);
app.use(middleware.cache);

// db
app.use(db());

// state
app.use(middleware.state);

// body file upload
app.use(koaBody());

// args
app.use(middleware.args);

if (state === 'api') {
  app.use(middleware.safeVerify);
} else {
  //app.use(new csrf());
  //app.use(middleware.csrf);
  // csrf
  csrf(app);
  app.use(convert(middleware.csrf));
}

// router
app.use(router.routes()).use(router.allowedMethods());
// static must after router
app.use(serveStatic(__dirname + '/static'));

// app.listen(port, ()=>{
//   console.log('listen' + port);
// })

// error
if (!config.debug) {
  app.use(async(ctx, next) => {
    var status;
    try {
      await next;
      if (404 == ctx.response.status && !ctx.response.body) {
        ctx.throw(404);
      }
    } catch (err) {
      //ctx.app.emit('error', err, this);
      status = err.status || err.code || err.statusCode || 500;
      status = status - 0 || 500;
      ctx.redirect('/error' + status);
    }
  });
  app.on('error', function(err, ctx) {
    console.error('[ERROR]', err, ctx);
  });
}

if (!config.debug && cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker) {
    console.log('worker %s died', worker.process.pid);
  });
} else {
  // server start
  app.listen(port, host, function() {
    console.log('[INFO] Server running on http://%s:%s ', host, port);
  });
}
