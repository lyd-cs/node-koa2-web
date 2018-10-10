// db
var redis = require('redis');
var coRedis = require('co-redis');

var util = require('./util');
var proxy = require('./proxy');

var config = util.setting;
var redisSlaveOpt = config.redis;
//var redisJavaOpt = config.redisGet;
//var redisMasterOpt = config.redisMaster;
var redisSessionOpt = config.session.store;

// redisSlave for read
var redisSlave = redis.createClient(
      redisSlaveOpt.port,
      redisSlaveOpt.host,
      redisSlaveOpt.options);
// swtich db
redisSlave.select(redisSlaveOpt.db);

// redisSlave for java read
// var redisJavaSlave = redis.createClient(
//       redisJavaOpt.port,
//       redisJavaOpt.host,
//       redisJavaOpt.options);
// // swtich db
// redisJavaSlave.select(redisJavaOpt.db);

// redisMaster for write (session other)
// var redisMaster = redis.createClient(
//       redisMasterOpt.port,
//       redisMasterOpt.host,
//       redisMasterOpt.options);
// // swtich db
// redisMaster.select(redisMasterOpt.db);

// redisSession for session
var redisSession = redis.createClient(
  redisSessionOpt.port,
  redisSessionOpt.host,
  redisSessionOpt.options
);
redisSession.select(redisSessionOpt.db);

db.proxy = proxy;
//db._redisMaster = redisMaster;
db._redisSlave = redisSlave;

//db.redisMaster = coRedis(redisMaster);
db.redisSlave = db.redis = coRedis(redisSlave);
//db.redisJavaSlave = db.redisGet = coRedis(redisJavaSlave);
db.redisSession = coRedis(redisSession);

//console.log('db init');

// export
module.exports = db;

function db(){
  return async(ctx, next) => {
    // proxy
    ctx.proxy = proxy;
    // redis read
    // origin
    ctx._redis = ctx._redisSlave = db._redisSlave;
    // co-redis
    ctx.redis = ctx.redisSlave = db.redisSlave;
    //ctx.redisGet = ctx.redisJavaSlave = db.redisJavaSlave;
    // redis write
    ctx.redisSession = db.redisSession;
    // origin redis
    //ctx._redisMaster = db._redisMaster;
    // co-redis
    //ctx.redisMaster = db.redisMaster;
    await next();
  };
}
