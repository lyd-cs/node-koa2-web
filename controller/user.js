'use strict';
var url = require('url');

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const qr = require('qr-image');
const ErrorStatus = require('../lib/status');

const {
  _,
  log4js,
  AJAX_ERROR,
  AJAX_SUCCESS,
  INCOME_TREATMENT
} = util;

const logger = log4js.getLogger('user');

const DEFAULT_LOGIN = '/';
// var SINGUP_STEP_1 = '/signup/name';
// var SINGUP_STEP_2 = '/signup/paypass';
//var ACCOUNT = '/account';

/**
 * get mobile
 */
function getMobile(k) {
  var ctx = this;
  if (!k) {
    k = 'mobile';
  }
  return ctx
    .checkBody(k)
    .notEmpty(ErrMsg.isMobile)
    .trim().value;
}

/**
 * get signup form data from req.body
 */
function getSignupData() {
  var ctx = this;
  var data = {
    mobile: ctx
      .checkBody('mobile')
      .notEmpty(ErrMsg.emptyMobile)
      .match(util.reMobile, ErrMsg.isMobile)
      .trim().value,
    smscode: ctx
      .checkBody('smscode')
      .notEmpty(ErrMsg.emptyCode)
      .len(4, 6, ErrMsg.lenSmsCode)
      .trim().value,
    password: ctx
      .checkBody('password')
      .notEmpty(ErrMsg.emptyPwd)
      .len(8, 20, ErrMsg.lenPwd)
      .match(util.checkPassword, ErrMsg.purePwd)
      .trim().value
    // repeatPassword: ctx.checkBody('repwd').notEmpty(ErrMsg.emptyPwd).len(8, 20, ErrMsg.lenPwd).trim().value,
  };
  return data;
}

/*
 * get realname data
 * */
function getRealnameData() {
  var ctx = this;
  var data = {
    name: ctx
      .checkBody('username')
      .notEmpty(ErrMsg.emptyRealname)
      .match(util.reRealMinorityName, ErrMsg.isRealname)
      .trim().value,
    idNo: ctx
      .checkBody('identityCard')
      .notEmpty(ErrMsg.emptyIdentity)
      .len(18, 18, ErrMsg.isIdentity)
      .trim().value,
    cashPassword: ctx
      .checkBody('password')
      .notEmpty(ErrMsg.emptyPwd)
      .len(8, 20, ErrMsg.lenPwd)
      .match(util.checkPassword, ErrMsg.purePwd).value,
    repeatCashPwd: ctx
      .checkBody('confirmPassword')
      .notEmpty(ErrMsg.emptyPwd)
      .len(8, 20, ErrMsg.lenPwd)
      .trim().value
  };
  return data;
}

const user = async(ctx, next) => {
  await next();
};

user.checkMobile = async ctx => {
  const {
    ipAddress,
    platform
  } = ctx.args;
  var _data = {
    mobile: getMobile.call(ctx),
    ipAddress,
    platform
  };
  var data = await ctx.proxy.userCheckMobile(_data);
  if (!data) {
    ctx.body = false;
    return;
  }
  var ret = JSON.parse(data);
  if (ret.status !== 0 || ret.data.exist !== '0') {
    ctx.body = false;
    return;
  }

  ctx.body = true;
};

user.checkExistMobile = async(ctx, next) => {
  const {
    ipAddress,
    platform
  } = ctx.args;
  var fail = false;
  var success = true;
  var _data = {
    mobile: getMobile.call(ctx),
    ipAddress,
    platform
  };
  var data = await ctx.proxy.userCheckMobile(_data);
  if (!data) {
    ctx.body = fail;
    return;
  }

  var ret = JSON.parse(data);
  if (!ret || ret.status !== 0) {
    ctx.body = fail;
    return;
  }
  if (ret.data.exist == 1) {
    ctx.body = success;
    return;
  }
  ctx.body = fail;
  await next();
};

user.signup = async(ctx, next) => {
  const {
    utmSource
  } = ctx.args;
  const inviteId = ctx.checkParams('id').value || '';
  const userInfo = inviteId && (await ctx.redis.hgetall(util.k_user(inviteId)));
  Object.assign(ctx.state, {
    inviteSerial: (userInfo && _.get(userInfo, 'inviteSerial')) || '',
    isSignup: 1,
    webTitle: '注册',
    utmSource: utmSource || ''
  });
  await next();
};

user.signupPost = async(ctx, next) => {
  const service = ctx.service.user;
  const {
    platform,
    ipAddress,
    utmSource
  } = ctx.args;
  let data;
  let checkSmsData;
  data = getSignupData.apply(ctx);
  checkSmsData = {
    mobile: data.mobile,
    smsCode: data.smscode,
    type: util.smscode['signup'],
    utmSource,
    ipAddress,
    platform
  };
  _.extend(data, {
    sessionId: ctx.sessionId,
    version: '1.0',
    isFromMobile: false,
    utmSource,
    platform,
    ipAddress
  });
  data.inviteSerial = ctx.checkBody('inviteSerial').value || '';
  data.sourceValue = ctx.checkBody('sourceValue').value;
  data.repeatPassword = ctx
    .checkBody('password')
    .notEmpty(ErrMsg.emptyPwd)
    .len(8, 20, ErrMsg.lenPwd)
    .match(util.checkPassword, ErrMsg.purePwd)
    .trim().value;
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    await service.fetch(checkSmsData, 'verifycode/check');
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }

  try {
    let value = await service.update(data, 'signup');
    ctx.session.isLogin = true;
    ctx.session.loginCount = 0;
    ctx.session.user = {
      id: _.get(value, 'userId') - 0 || 0,
      name: _.get(value, 'username', ''),
      mobile: _.get(value, 'mobile') - 0 || 0,
      time: Date.now()
    };
    ctx.session.signupSuccess = 1;
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON();

  await next();
};

user.login = async(ctx, next) => {
  var WEB_HOST = ctx.hostname;
  var reUrl = ctx.get('Referer');
  ctx.state.webTitle = '登录';

  if (reUrl) {
    var refereUrl = url.parse(reUrl).pathname;
    var _host = url.parse(reUrl).hostname;

    if (_host === WEB_HOST) {
      if (
        refereUrl === '/' ||
        refereUrl === '/signup' ||
        refereUrl === '/login' ||
        refereUrl === '/forgot'
      ) {
        ctx.session.loginUrl = DEFAULT_LOGIN;
      } else {
        ctx.session.loginUrl = refereUrl;
      }
    } else {
      ctx.session.loginUrl = DEFAULT_LOGIN;
    }
  }
  await next();
};

// login check
user.loginCheck = async(ctx, next) => {
  var isLogin = ctx.state.isLogin;
  if (isLogin) {
    ctx.redirect('/');
    return;
  }
  await next();
};

// login required
user.loginRequired = async(ctx, next) => {
  ctx.state.isLogin = ctx.session.isLogin;
  var isLogin = ctx.state.isLogin;
  if (!isLogin) {
    // login jump back
    if (ctx.session.loginUrl) {
      ctx.session.loginUrl = ctx.url;
    } else {
      ctx.session.nextUrl = ctx.url;
    }

    ctx.redirect('/login');
    return;
  }
  await next();
};

user.loginNextUrl = async(ctx, next) => {
  await next();
};

user.signupRealname = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var data;
  var _render = function() {
    ctx.state.query = data;
    ctx.state.errors = ctx.errors;
  };
  //method 'post' response
  data = getRealnameData.apply(ctx);
  _.extend(data, {
    userId,
    ipAddress,
    platform
  });
  if (ctx.errors) {
    _render();
    return await next();
  }
  //checkout data
  if (!util.isIdentityCode(data.idNo)) {
    ctx.addError('isIdentityCode', ErrMsg.isIdentity);
    _render();
    return await next();
  }
  if (data.cashPassword !== data.repeatCashPwd) {
    ctx.addError('repwd', ErrMsg.rePwd);
    _render();
    return await next();
  }
  try {
    var userSignupRealnameData = await ctx.proxy.setSecureAuth(data);
    if (!userSignupRealnameData) {
      ctx.addError('result', ErrMsg.def);
      _render();
      return await next();
    }
    var ret = JSON.parse(userSignupRealnameData);

    if (ret.status !== 0) {
      ctx.addError('result', ret.message);
      _render();
      return await next();
    }
    //success
    // ctx.state.RealnameDone = true;
    ctx.redirect('/signup/name/result');
    return await next();
  } catch (err) {
    ctx.addError('result', ErrMsg.def);
  }
  await next();
};

user.loginPost = async(ctx, next) => {
  var loginCount = (ctx.session.loginCount = ctx.session.loginCount || 0);
  var nextUrl;
  const {
    ipAddress,
    platform
  } = ctx.args;

  loginCount = ctx.session.loginCount++;
  if (loginCount >= 2) {
    ctx.state.loginCount = loginCount;
  }
  var _render = function() {
    ctx.state.query = data;
    ctx.state.errors = ctx.errors;
    ctx.state.webTitle = '登录';
  };
  var data = {
    mobile: ctx
      .checkBody('mobile')
      .notEmpty(ErrMsg.isMobile)
      .trim().value,
    password: ctx
      .checkBody('password')
      .trim()
      .notEmpty(ErrMsg.login).value,
    sessionId: ctx.sessionId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    _render();
    return await next();
  }
  var value = await ctx.proxy.userLoginPost(data);

  if (!value) {
    ctx.addError('page', ErrMsg.def);
    _render();
    return await next();
  }
  var ret = JSON.parse(value);
  if (ret.status !== 0) {
    ctx.addError('page', ret.message);
    _render();
    return await next();
  }

  ctx.session.isLogin = true;
  ctx.session.loginCount = 0;
  ctx.session.user = {
    id: _.get(ret, 'data.userId') - 0 || 0,
    name: _.get(ret, 'data.username') || '',
    mobile: data.mobile,
    time: Date.now()
  };
  if (ctx.session.loginUrl) {
    nextUrl = ctx.session.loginUrl || DEFAULT_LOGIN;
  } else {
    nextUrl = ctx.session.nextUrl || DEFAULT_LOGIN;
  }
  if (ctx.session.loginUrl) {
    delete ctx.session.loginUrl;
  }
  if (ctx.session.nextUrl) {
    delete ctx.session.nextUrl;
  }
  ctx.redirect(nextUrl);
  await next();
};

user.logout = async(ctx, next) => {
  ctx.session.isLogin = false;
  ctx.session.user = null;
  //ctx.session.nextUrl = null;
  if (ctx.session.loginUrl) {
    delete ctx.session.loginUrl;
  }
  if (ctx.session.nextUrl) {
    delete ctx.session.nextUrl;
  }
  ctx.state.nextUrl = '/';
  ctx.redirect('/');
  await next();
};

user.forgot = async(ctx, next) => {
  const {
    ipAddress,
    platform
  } = ctx.args;
  var _render = function() {
    ctx.state.query = data;
    ctx.state.errors = ctx.errors;
  };
  if (ctx.method == 'POST') {
    const action = ctx.checkBody('action').value;
    if (action == 'telephone') {
      var data = {
        mobile: ctx
          .checkBody('mobile')
          .trim()
          .notEmpty(ErrMsg.isMobile).value,
        smsCode: ctx
          .checkBody('smscode')
          .notEmpty(ErrMsg.isSmsCode)
          .trim().value,
        code: ctx
          .checkBody('captcha')
          .trim()
          .notEmpty(ErrMsg.isCaptcha).value,
        type: 'RESETPASSWORD',
        ipAddress,
        platform
      };
      if (ctx.errors) {
        _render();
        return await next();
      }
      await ctx.proxy.checkSmsCode(data).then(function(value) {
        if (!value) {
          ctx.addError('page', ErrMsg.lenSmsError);
          _render();
          return;
        }
        var ret = JSON.parse(value);
        if (!ret || ret.status !== 0) {
          ctx.addError('page', ret.message);
          _render();
          return;
        }
        //ctx.body = true;
        ctx.session.forgotMobile = data.mobile;
        ctx.state.tpl = 'user.forgot.step2.pug';
      });
    } else if (action == 'password') {
      var _newPassword = ctx
        .checkBody('newPassword')
        .trim()
        .notEmpty(ErrMsg.emptyNewPwd).value;
      var _repeatPassword = ctx
        .checkBody('repeatPassword')
        .trim()
        .notEmpty(ErrMsg.emptyNewPwd).value;
      var _data = {
        mobile: ctx.session.forgotMobile,
        password: _newPassword,
        repeatPwd: _repeatPassword,
        ipAddress,
        platform
      };

      if (_data.newPassword !== _data.repeatPassword) {
        ctx.addError('page', ErrMsg.rePwd);
        ctx.state.tpl = 'user.forgot.step2.pug';
      }
      await ctx.proxy.userForgotPost(_data).then(function(value) {
        if (!value) {
          ctx.state.tpl = 'user.forgot.step3.pug';
          return;
        }
        var ret = JSON.parse(value);
        if (!ret || ret.status !== 0) {
          ctx.state.tpl = 'user.forgot.step2.pug';
          ctx.addError('page', ret.message);
          return;
        }
        ctx.state.isSuccess = true;
        ctx.state.tpl = 'user.forgot.step3.pug';
      });
    }
    return await next();
  }
  await next();
};

// captcha
user.captcha = async ctx => {
  const {
    ipAddress,
    platform
  } = ctx.args;
  await ctx.proxy
    .getCaptcha({
      ipAddress,
      platform
    })
    .then(
      function(value) {
        if (!value) {
          return;
        }
        var ret = JSON.parse(value);
        if (ret.status !== 0) {
          return;
        }
        var captcha = _.get(ret, 'data.base64');
        var word = _.get(ret, 'data.image');
        ctx.session.captcha = word.toLowerCase();
        ctx.session.captchacount = 0;
        ctx.type = 'image/png';
        ctx.body = new Buffer(captcha, 'base64');
      },
      function() {}
    );
};
user.checkCaptcha = async(ctx, next) => {
  var fail = false;
  var success = true;
  if (ctx.errors) {
    ctx.body = fail;
    return await next();
  }
  ctx.body = success;
  await next();
};

user.createAccountPost = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var _userState = _.get(ctx.state, 'userState');
  var _isIdPassed = _.get(_userState, 'isIdPassed') - 0 || 0;
  var _isBindCard = _.get(_userState, 'hasBindCard') - 0 || 0;
  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var data = {
    userId,
    ipAddress,
    platform
  };
  if (!_isIdPassed) {
    data.name = ctx
      .checkBody('name')
      .notEmpty(ErrMsg.emptyRealname)
      .match(util.reRealMinorityName, ErrMsg.isRealname)
      .trim().value;
    data.idNo = ctx
      .checkBody('idNo')
      .notEmpty(ErrMsg.emptyIdentity)
      .len(18, 18, ErrMsg.isIdentity)
      .trim().value;
  }
  if (!_isBindCard) {
    _.extend(data, {
      bankCode: ctx.checkBody('bankCode').value,
      cardNumber: ctx
        .checkBody('bankNumber')
        .notEmpty(ErrMsg.isBankIdEmpty)
        .trim().value,
      mobileNumInBank: ctx
        .checkBody('mobile')
        .notEmpty(ErrMsg.emptyMobile)
        .trim().value
    });
  }
  data.cashPassword = ctx
    .checkBody('tradPwd')
    .notEmpty(ErrMsg.emptyPwd)
    .len(6, 6, ErrMsg.lenTradPwd).value;

  if (ctx.errors) {
    ctx.body = err;
    return;
  }
  if (data.idNo && !util.isIdentityCode(data.idNo)) {
    err.message = ErrMsg.isIdentity;
    ctx.body = err;
    return;
  }
  var value = await ctx.proxy.accountBindCardAndPerfectInfo(data);
  logger.info('user.account.escow.result', value);
  if (!value) {
    err.message = ErrMsg.def;
    ctx.body = err;
    return;
  }
  var ret = JSON.parse(value);
  if (!ret || ret.status !== 0) {
    err.message = ret.message || ErrMsg.def;
    ctx.body = err;
    return;
  }
  ctx.body = success;
  await next();
};

user.createAccount = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var _userState = _.get(ctx.state, 'userState');
  var _isBindCard = _.get(_userState, 'hasBindCard') - 0 || 0;
  var _isCreateEscrowAcc = _.get(_userState, 'isCreateEscrowAcc') - 0 || 0;
  var _isCashPasswordPassed =
    _.get(_userState, 'isCashPasswordPassed') - 0 || 0;
  if (_isCreateEscrowAcc && _isBindCard && _isCashPasswordPassed) {
    ctx.redirect('/');
  }
  var data = {
    userId,
    ipAddress,
    platform
  };
  ctx.state.bankTips = util.bankTips;
  ctx.state.bankCodeList = util.bankCodeList;
  if (_isBindCard) {
    var value = await ctx.proxy.accountWithDrawUserCard(data);
    if (!value) {
      return await next();
    }
    var ret = JSON.parse(value);
    if (!ret || ret.status !== 0) {
      return await next();
    }
    ctx.state.userBank = _.get(ret, 'data.userBank');
  }

  await next();
};

user.bankCardChecked = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var bankcode = ctx
    .checkBody('banknumber')
    .trim()
    .replace(/\s/g, '').value;
  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var _data = {
    userId,
    ipAddress,
    platform,
    cardNo: bankcode
  };
  var value = await ctx.proxy.createAccountBankCardCheck(_data);
  if (!value) {
    ctx.body = err;
    return;
  }
  var ret = JSON.parse(value);
  if (!ret || ret.status !== 0) {
    err.message = ret.message;
    ctx.body = err;
    return;
  }
  success.data = ret.data;
  ctx.body = success;
  await next();
};

/**
 * send Verify Code
 */
user.sendVerifyCode = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var errMsg = ErrMsg.sendVerifyCodeError;
  var isLogin = ctx.state.isLogin;
  var action = ctx.checkBody('action').value;
  var data;
  var last = _.get(ctx.session, 'lastsms', 0) - 0;
  var interval = 56 * 1000; // 60sec
  var usermobile =
    ctx.checkBody('mobile').value || _.get(ctx.state, 'user.mobile', null);
  var key;
  var message;
  if (ctx.errors) {
    message = _.get(Object.values(_.get(ctx.errors, '[0]')), '[0]');
    key = _.get(Object.keys(_.get(ctx.errors, '[0]')), '[0]');
    err.data = {};
    err.data[key] = err.message = message;
    ctx.body = err;
    return;
  }
  if (!action || action.length < 3) {
    ctx.body = err;
    return;
  }
  // just singup need verifyCode
  // not singup clean error
  if (action && action.length && action !== 'signup') {
    ctx.errors = null;
  }
  // echo verifyCode error
  if (ctx.errors) {
    // err.message = _.get(Object.values(_.get(ctx.errors, '[0]')), '[0]');
    ctx.body = err;
    return;
  }
  // check time interval
  if (Date.now() - last < interval) {
    err.message = ErrMsg.quickSmsCode;
    ctx.body = err;
    return;
  }

  data = {
    mobile: isLogin ? usermobile : getMobile.apply(ctx),
    userId: userId,
    type: isLogin && (action === 'paypass' || action === 'check') ?
      '' : util.smscode[action],
    ipAddress,
    platform
  };

  // validate err
  if (ctx.errors) {
    ctx.body = err;
    return;
  }

  // log verifyCode

  // TODO: check mobile not blacklist
  var interFace =
    action == 'signupVoice' ? 'getVoiceSmscode' : 'sendValidateCode';
  await ctx.proxy[interFace](data).then(
    function(value) {
      if (!value) {
        err.message = ErrMsg.def;
        ctx.body = err;
        return;
      }
      var ret = JSON.parse(value);
      if (ret.status !== 0) {
        err.message = ret.message || errMsg;
        ctx.addError('page', err.message);
        ctx.body = err;
        return;
      }
      ctx.body = success;
    },
    function(error) {
      logger.error('user.VerifyCode.error', error);
      ctx.addError('page', errMsg);
    }
  );
  ctx.session.lastsms = Date.now();
  await next();
};
// verify captcha
user.verifyCaptcha = async(ctx, next) => {
  ctx.session.captchacount = ctx.session.captchacount || 1;
  ctx.session.captchacount++;
  var code = _.get(ctx.session, 'captcha', '100000');
  var captcha = ctx
    .checkBody('captcha')
    .notEmpty(ErrMsg.lenCaptcha)
    .trim()
    .toLowercase().value;
  //var count = ctx.session.captchacount;

  // if (count > 10) {
  //   ctx.addError('captcha', ErrMsg.expireCaptcha);
  //   return await next();
  // }
  if (ctx.errors || code !== captcha) {
    ctx.addError('captcha', ErrMsg.isCaptchaCorrect);
    return await next();
  }
  //ctx.dumpJSON();
  await next();
};
user.identityAuth = async(ctx, next) => {
  var _userState = _.get(ctx.state, 'userState');
  //var _userId = _.get(ctx.state, 'user.id') - 0 || 0;
  //var _user = await ctx.redisGet.hgetall(util.k_user(_userId));
  var _userIdentityAuth = _.get(_userState, 'isCreateEscrowAcc') - 0 || 0;
  var _userHasBindCard = _.get(_userState, 'hasBindCard') - 0 || 0;
  var _isTradPwd = _.get(_userState, 'isCashPasswordPassed') - 0 || 0;
  if (!_userIdentityAuth || !_isTradPwd) {
    ctx.redirect('/deposit/createaccount');
  }
  if (_userIdentityAuth && _isTradPwd && !_userHasBindCard) {
    ctx.redirect('/account/bank/add');
  }
  await next();
};
user.checkEscrowAccount = async(ctx, next) => {
  var _userState = _.get(ctx.state, 'userState');
  var _userIdentityAuth = _.get(_userState, 'isCreateEscrowAcc') - 0 || 0;
  var _isTradPwd = _.get(_userState, 'isCashPasswordPassed') - 0 || 0;
  if (!_userIdentityAuth || !_isTradPwd) {
    ctx.redirect('/deposit/createaccount');
  }
  await next();
};
user.checkIdentity = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var err = _.clone(AJAX_ERROR);
  var _identity = ctx
    .checkBody('identity')
    .notEmpty(ErrMsg.emptyIdentity)
    .trim().value;
  if (ctx.errors) {
    ctx.body = err;
    return await next();
  }
  var _data = {
    idNo: _identity,
    userId,
    ipAddress,
    platform
  };
  try {
    await ctx.proxy.checkIdentityAuth(_data).then(function(value) {
      if (!value) {
        ctx.throw(ErrMsg.def);
      }
      var ret = JSON.parse(value);
      if (ret.status !== 0) {
        ctx.throw(ret.message);
      }
      ctx.body = true;
    });
  } catch (error) {
    //ctx.addError('page', error.message);
    //err.message = error.message;
    ctx.body = false;
    return await next();
  }
  return await next();
};
user.postGuardScore = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const score = ctx
    .checkBody('score')
    .notEmpty(ErrMsg.isEmptyRiskScore)
    .trim().value;
  const option = ctx.checkBody('scoreDetail').value || '0, 0, 0, 0, 0, 0, 0, 0';
  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var query = {
    score,
    option,
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }

  await ctx.proxy.accountRiskVail(query).then(
    function(value) {
      if (!value) {
        ctx.body = err;
        return;
      }
      const ret = JSON.parse(value);
      if (ret.status !== 0) {
        err.message = ret.message;
        ctx.body = err;
        return;
      }
      ctx.body = success;
    },
    function() {}
  );
};

user.qrcode = async ctx => {
  const id = ctx.checkParams('id').value - 0;
  let action = ctx.checkParams('action').value;
  const dict = {
    inviteh5: `https://m.hoomxb.com/landing/about/${id}?utmSource=Group4-SalesH5`,
    invitepc: `https://m.hoomxb.com/landing/invite/register/${id}?utmSource=PC-1001`
  };
  // set default action
  if (!action || !dict[action]) {
    action = 'inviteh5';
  }
  ctx.type = 'image/png';
  ctx.body = qr.image(dict[action], {
    margin: 1
  });
};

user.jdActiveSignup = async(ctx, next) => {
  const service = ctx.service.plan;

  const {
    userId,
    ipAddress,
    platform,
    utmSource
  } = ctx.args;
  let query = {
    userId,
    ipAddress,
    platform,
    isActivice: 1,
    cashType: INCOME_TREATMENT.INVEST
  };

  let ret;
  let planList;
  try {
    ret = await service.query(query, 'home/recommend');
    planList = _.get(ret, 'dataList') || {};
    ctx.state.planList = planList;
  } catch (error) {
    ctx.addError('result', error._message || ErrMsg.def);
  }

  Object.assign(ctx.state, {
    utmSource: utmSource || 'Group4-Web',
    isJdActive: true
  });

  await next();
};

user.redpacket = async(ctx, next) => {
  const service = ctx.service;
  const promotion = _.get(ctx.state, 'userState.promotion') || '';
  const isActiveUser =
    promotion.startsWith('Group3') || promotion.startsWith('Group6');
  let values;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  let data = {
    userId,
    ipAddress,
    platform,
    isActivice: isActiveUser ? '1' : '',
    cashType: INCOME_TREATMENT.INVEST
  };

  try {
    values = await Promise.all([
      service.plan.query(data, 'home/recommend'),
      service.user.query(data, 'userJdCard')
    ]);
    ctx.state.dataList = _.get(values, '[0].dataList');
    ctx.state.cardList = _.get(values, '[1].userCards') || [];
  } catch (error) {
    ctx.addError('result', error._message || ErrMsg.def);
  }

  await next();
};

module.exports = user;