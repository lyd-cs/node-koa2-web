'use strict';

const cache = require('../cache');
const ErrorStatus = require('../lib/status');
const ErrMsg = require('../lib/errormsg');

const {
  _,
  log4js,
  config,
  DEFAULT_PAGE_SIZE,
  checkPage,
  checkPageSize,
  reHostname
} = require('./util');

const logger = log4js.getLogger('middleware');

const HTTP_POST = 'POST';

exports.csrf = function*(next) {
  // ignore get, head, options
  // charge notify url & back charge should not assertCSRF
  if (
    this.method === 'GET' ||
    this.method === 'HEAD' ||
    this.method === 'OPTIONS' ||
    this.path === '/account/charge/result' ||
    this.path === '/Gateway_client/fundAction_gatewayRechargeRequest' ||
    this.path === 'https://gw.baofoo.com/payindex'
  ) {
    return yield next;
  }
  //if (this.path === '/api/verifycode/send'){
  //  console.log(this.request.ip, this.request.body, this.request.ips);
  //}

  var body = this.request.body;
  // koa-body fileds. multipart fields in body.fields
  body = body.fields || body;

  // bodyparser middlewares maybe store body in request.body
  // or you can just set csrf token header
  this.assertCSRF(body);

  yield next;
};

exports.cache = async(ctx, next) => {
  ctx.cache = cache;
  await next();
};

exports.addError = async(ctx, next) => {
  ctx.addError = function(k, v) {
    if (!ctx.errors) {
      ctx.errors = [];
    }
    var e = {};
    e[k] = v;
    ctx.errors.push(e);
    return ctx;
  };
  ctx.getError = function(k) {
    if (!ctx.errors) {
      return;
    }
    var arr = ctx.errors;
    var obj;
    if (k) {
      obj = arr.find(element => {
        return element.hasOwnProperty(k);
      });
    }
    // 没有找到k对应的obj,或者没有k,取得默认第一个
    if (!obj) {
      obj = arr[0];
      k = Object.keys(obj)[0];
    }
    var name = k;
    var message = obj[k];
    return {
      name,
      message
    };
  };
  ctx.getErrors = function() {
    if (!ctx.errors) {
      return;
    }
    var arr = ctx.errors;
    var obj = {};
    arr.forEach(function(el) {
      Object.keys(el).forEach(function(k) {
        if (!obj[k]) {
          obj[k] = [];
        }
        obj[k].push(el[k]);
      });
    });
    return obj;
  };
  await next();
};

exports.state = async(ctx, next) => {
  const session = ctx.session;
  const _hoomxbBeian = reHostname.test(ctx.host)
    ? '沪ICP备14046628号-2'
    : '沪ICP备17053575号-1';
  ctx.state = {
    debug: config.debug,
    isLogin: false,
    user: null,
    session: session,
    csrf: ctx.csrf,
    path: ctx.path,
    hoomxbBeian: _hoomxbBeian
  };
  // debug
  if (config.debug) {
    ctx.state._request = ctx.request;
  }
  //logger.warn('app.session.isLogin', session);
  if (session.isLogin) {
    ctx.state.isLogin = true;
    ctx.state.user = session.user;
  }

  // global userState
  await Promise.all([
    cache.home.get_global(),
    session.isLogin ? cache.user.get_state(session.user.id) : {},
    cache.bank.get_bank_list()
  ]).then(
    function(values) {
      ctx.state.global = values[0];
      ctx.state.userState = values[1];
    },
    function(error) {
      logger.error('app.user.state', error);
    }
  );

  await next();
};

exports.args = async(ctx, next) => {
  const PLATFORMS = {
    web: 'PC'
    // 20180612 移动端 改成user-agent
    //mobile: 'MOBILE'
  };
  const HEADER_USER_AGENT_KEY = 'x-hxb-user-agent';
  const userAgent = ctx.get(HEADER_USER_AGENT_KEY) || ctx.get('user-agent');

  // user
  const isLogin = !!_.get(ctx.state, 'isLogin');
  const userId = _.get(ctx.state, 'user.id', 0) - 0 || 0;
  const isNewbie = !!(_.get(ctx.state, 'userState.isNewbie', 0) - 0);
  // pageSize & pageNumber
  const pageSize = checkPageSize(
    ctx.checkBody('pageSize').value || ctx.checkQuery('pageSize').value,
    DEFAULT_PAGE_SIZE
  );
  const pageNumber = checkPage(
    ctx.checkBody('page').value || ctx.checkQuery('page').value
  );
  const utmSource =
    ctx.checkBody('utmSource').value || ctx.checkQuery('utmSource').value;
  const marketSource =
    ctx.checkBody('marketSource').value || ctx.checkQuery('marketSource').value;
  // platform,如果不是PC, 就传userAgent
  const platform = (config.state && PLATFORMS[config.state]) || userAgent;

  ctx.args = {
    isLogin,
    userId,
    pageSize,
    pageNumber,
    utmSource,
    marketSource,
    platform,
    userAgent: userAgent,
    sessionId: ctx.sessionId,
    ipAddress: ctx.ip,
    isNewbie
  };

  await next();
};

// json dump
exports.dumpJSON = async(ctx, next) => {
  ctx.dumpJSON = function() {
    var status = 0;
    var msg;
    var err;
    var data = null;
    var errorData;

    for (var i = 0; i < arguments.length; i++) {
      var arg = arguments[i];
      if (arg instanceof Error) {
        err = arg;
        status = err.status || err.statusCode || status;
        continue;
      }
      switch (typeof arg) {
        case 'string':
          msg = arg;
          break;
        case 'number':
          status = arg;
          break;
        case 'object':
          data = arg;
          break;
      }
    }
    //console.log(status, msg, err);
    // 后端错误 消息和code 提出来
    if (err && err._status) {
      // 如果有后端返回消息，并且调用时候没有指定消息，使用后端返回消息
      if (!msg && err._message) {
        msg = err._message;
      }
      // 如果后端有返回数据，使用后端返回数据
      if (err._data) {
        data = err._data;
      }
      // 如果定制了后端错误码和消息，输出后端错误码和定制消息
      if (ErrorStatus.hasOwnProperty(err._status)) {
        status = err._status;
        // 定制消息有内容才使用，否则使用 err._message
        if (ErrorStatus[status]) {
          msg = ErrorStatus[status];
        }
      }
    } else if (ErrorStatus[status] && !msg) {
      msg = ErrorStatus[status];
    } else if (err && !msg) {
      msg = ErrorStatus[ErrorStatus.SERVER_FAIL];
    }
    // app 错误提示方式
    // http://doc.hoomxb.com/index.php?s=/2&page_id=474
    if (status) {
      errorData = {
        errorType: ErrorStatus(status)
      };
    }
    ctx.body = {
      status: status || 0,
      message: msg || 'success',
      data: data || {},
      errorData
    };
  };
  await next();
};

exports.safeVerify = async(ctx, next) => {
  if (ctx.path === '/token' || ctx.path.startsWith('/purge')) {
    return await next();
  }
  const HEADER_AUTH_TOKEN_KEY = 'x-hxb-auth-token';
  const HEADER_AUTH_TIME_STAMP = 'x-hxb-auth-timestamp';
  const MAX_DIFF_TIME = 5 * 60 * 1000;
  const now = Date.now();
  const sessionId = ctx.get(HEADER_AUTH_TOKEN_KEY);
  const { isNew } = ctx.session;

  // 没有token,没有userAgent,token和session不一致, session是这次才创建的
  if (!sessionId || sessionId != ctx.sessionId || isNew) {
    ctx.throw(ErrorStatus.TOKEN_REQUIRED);
    return;
  }

  //const { userAgent } = ctx.args;
  // API platform = userAgent ;args做了，不用再处理
  //Object.assign(ctx.args, {
  //  platform: userAgent
  //});

  if (config.debug) {
    return await next();
  }
  if (ctx.method === HTTP_POST) {
    const last = ctx.session.lastTimeStamp - 0 || -1;
    const current = ctx.get(HEADER_AUTH_TIME_STAMP);
    const diff = Math.abs(current - now);
    if (!current || last > current || diff > MAX_DIFF_TIME) {
      ctx.dumpJSON(412, ErrMsg.isTimestampErr);
      return;
    }
    ctx.session.lastTimeStamp = current;
  }
  await next();
};

// X-Response-Time
exports.responseTime = async(ctx, next) => {
  var start = Date.now();
  await next();
  var ms = Date.now() - start;
  ctx.set('X-Response-Time', ms + 'ms');
};

// last request time
exports.lastRequstTime = async(ctx, next) => {
  // 自动延长session时间
  ctx.session.lastRequstTime = Date.now();
  await next();
};
