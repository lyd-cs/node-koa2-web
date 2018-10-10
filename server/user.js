'use strict';

const util = require('../lib/util');
const ErrorStatus = require('../lib/status');
const ErrMsg = require('../lib/errormsg');

const { _, log4js, API_SUCCESS, API_ERROR, limitShow, parseUserAgent } = util;
const logger = log4js.getLogger('API:user');

/**
 * get mobile
 */
// function getMobile(k) {
//   var ctx = this;
//   if (!k) {
//     k = 'mobile';
//   }
//   return ctx.checkBody(k).notEmpty(ErrMsg.isMobile).trim().value;
// }
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
      .trim().value,
    sourceValue: ctx
      .checkBody('inviteCode')
      .empty()
      .match(util.checkInvitationCode, ErrMsg.invitationCodeError)
      .trim().value
  };
  return data;
}
// /**
//  * get login form data from req.body
//  */
// function getLoginData() {
//   var ctx = this;
//   var data = {
//     username: getMobile.call(ctx, 'username'),
//     password: ctx.checkBody('password').trim().notEmpty(ErrMsg.login).len(3, 50, ErrMsg.login).value,
//     ipAddress: ctx.ip
//   };

//   data.mobileNumber = data.username;
//   return data;
// }
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
    ipAddress: ctx.ip
  };
  return data;
}

function getBankInfo(obj = {}) {
  return {
    bankName: obj.name || '--',
    quota: limitShow(obj, false)
  };
}

const user = async(ctx, next) => {
  await next();
};
user.loginRequired = async(ctx, next) => {
  //ctx.state.isLogin = ctx.session.isLogin;
  var isLogin = ctx.session.isLogin;

  if (!isLogin) {
    ctx.throw(ErrorStatus.LOGIN_REQUIRED);
    return;
  }
  await next();
};
user.checkMobile = async(ctx, next) => {
  const { ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _usermobile = ctx
    .checkBody('mobile')
    .notEmpty(ErrMsg.emptyMobile)
    .match(util.reMobile, ErrMsg.isMobile)
    .trim().value;
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  var _data = {
    ipAddress,
    platform,
    mobile: _usermobile
  };
  var data = await ctx.proxy.userCheckMobile(_data);

  if (!data) {
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(data);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  if (ret.data.exist !== '0') {
    error.message = ErrMsg.mobileExists;
    ctx.body = error;
    return await next();
  }

  success.data = ret.data;
  ctx.body = success;
};

user.checkExistMobile = async(ctx, next) => {
  const { ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _data = {
    ipAddress,
    platform,
    mobile: ctx
      .checkBody('mobile')
      .notEmpty(ErrMsg.emptyMobile)
      .match(util.reMobile, ErrMsg.isMobile)
      .trim().value
  };
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  var data = await ctx.proxy.userCheckMobile(_data);
  if (!data) {
    ctx.body = error;
    return;
  }
  var ret = JSON.parse(data);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return;
  }
  if (ret.data.exist == 1) {
    success.data = _.get(ret, data) || {};
    ctx.body = success;
    return await next();
  }

  error.message = ErrMsg.noRegister;
  ctx.body = error;
  await next();
};

user.signupPost = async(ctx, next) => {
  const { ipAddress, platform, userAgent } = ctx.args;
  const { isAndroid } = parseUserAgent(userAgent);
  const operatingSystem = isAndroid ? 'Android' : 'iOS';

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var data = getSignupData.apply(ctx);
  var checkSmsData = {
    mobile: data.mobile,
    smsCode: data.smscode,
    type: util.smscode['signup'],
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  try {
    await ctx.proxy.checkSmsCode(checkSmsData).then(
      function(value) {
        if (!value) {
          ctx.throw(ErrMsg.def);
        }
        var ret = JSON.parse(value);

        if (ret.status !== 0) {
          ctx.throw(ret.message);
        }
      },
      function() {
        ctx.throw(ErrMsg.def);
      }
    );
  } catch (err) {
    logger.error('user.signup.err', err.message);
    error.message = err.message;
    ctx.body = error;
    return await next();
  }

  var _data = _.assign(data, ctx.args, {
    repeatPassword: data.password,
    isFromMobile: true,
    utmSource: `Group4-${operatingSystem}`
  });

  try {
    var userSignupData = await ctx.proxy.userSignupPost(_data);

    if (!userSignupData) {
      error.message = ErrMsg.def;
      ctx.body = error;
      return;
    }
    var ret = JSON.parse(userSignupData);
    if (ret.status !== 0) {
      error.message = ret.message;
      ctx.body = error;
      return;
    }
    //success save session
    ctx.session.isLogin = true;
    ctx.session.loginCount = 0;
    ctx.session.user = {
      id: _.get(ret, 'data.userId') - 0 || 0,
      name: _.get(ret, 'data.username', ''),
      mobile: _.get(ret, 'data.mobile') - 0 || 0,
      time: Date.now()
    };
    success.data = _.get(ret, 'data');
    ctx.body = success;
  } catch (err) {
    error.message = ErrMsg.def;
    ctx.body = error;
  }
};

user.loginPost = async(ctx, next) => {
  const { sessionId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var loginCount = (ctx.session.loginCount = ctx.session.loginCount || 0);
  //var nextUrl;
  var _captcha = ctx.checkBody('captcha').value;
  var code = _.get(ctx.session, 'captcha', '100000');

  loginCount = ctx.session.loginCount++;

  if (loginCount >= 2 && !_captcha) {
    error.message = ErrMsg.emptyCaptcha;
    error.status = 102;
    ctx.body = error;
    return await next();
  }
  if (_captcha && code !== _captcha) {
    delete ctx.session.captcha;
    error.message = ErrMsg.isCaptcha;
    ctx.body = error;
    return await next();
  }
  var data = {
    mobile: ctx
      .checkBody('mobile')
      .notEmpty(ErrMsg.isMobile)
      .trim().value,
    password: ctx
      .checkBody('password')
      .trim()
      .notEmpty(ErrMsg.emptyPassword).value,
    sessionId,
    platform,
    ipAddress
  };

  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.PARAMS_FAIL, ErrMsg.login);
    return;
  }
  var value = await ctx.proxy.userLoginPost(data);

  if (!value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(value);
  if (ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
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
  // if (ctx.session.loginUrl) {
  //   nextUrl = ctx.session.loginUrl;
  // } else {
  //   nextUrl = ctx.session.nextUrl;
  // }
  if (ctx.session.loginUrl) {
    delete ctx.session.loginUrl;
  }
  if (ctx.session.nextUrl) {
    delete ctx.session.nextUrl;
  }
  success.data = ret.data;
  ctx.body = success;
};

// captcha
user.captcha = async ctx => {
  const { ipAddress, platform } = ctx.args;
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
      function(err) {
        logger.error('user.captcha', err);
      }
    );
};

// verify captcha
user.verifyCaptcha = async(ctx, next) => {
  ctx.session.captchacount = ctx.session.captchacount || 0;
  ctx.session.captchacount++;
  var code = _.get(ctx.session, 'captcha', '100000');
  var captcha = ctx
    .checkBody('captcha')
    .notEmpty(ErrMsg.lenCaptcha)
    .trim()
    .toLowercase().value;
  var count = ctx.session.captchacount;
  var maxCount = 10;

  if (count > maxCount) {
    ctx.addError('captcha', ErrMsg.expireCaptcha);
    return await next();
  }
  if (ctx.errors || code !== captcha) {
    ctx.addError('captcha', ErrMsg.isCaptcha);
    return await next();
  }
  await next();
};

//添加action 参数
user.verifyCodeAction = action => {
  return async(ctx, next) => {
    ctx.state.action = action;
    await next();
  };
};

user.captchaResult = async ctx => {
  if (ctx.errors) {
    let error = ctx.getError();
    ctx.dumpJSON(ErrorStatus.FAIL, error.message);
    return;
  }
  ctx.dumpJSON();
};

/**
 * send Verify Code
 */
user.sendVerifyCode = async ctx => {
  const service = ctx.service.user;

  const ACTIONS = {
    signup: {
      shouldCheckMobile: true,
      shouldCheckCaptcha: true,
      type: 'REGISTER'
    },
    forgot: {
      shouldCheckMobile: true,
      shouldCheckCaptcha: true,
      type: 'RESETPASSWORD'
    },
    newmobile: {
      shouldCheckMobile: true,
      shouldCheckCaptcha: true,
      type: 'UPDATEMOBILE'
    },
    tradpwd: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'RESETCASHPWD'
    },
    oldmobile: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'CHECKOLDMOBILE'
    },
    recharge: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'RECHARGE',
      shouldCheckAmount: true
    },
    quickpay: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'RECHARGE',
      shouldCheckAmount: true
    },
    withdraw: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: '',
      shouldCheckAmount: true
    },
    // 购买，使用充值的接口
    buy: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'RECHARGE',
      shouldCheckAmount: true
    },
    // 账户内计划退出
    planquit: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'APPLYQUIT',
      shouldCheckAmount: false
    },
    // 账户内计划冷静期取消加入
    planCancelBuy: {
      shouldCheckMobile: false,
      shouldCheckCaptcha: false,
      type: 'COOLINGOFF',
      shouldCheckAmount: false
    }
  };
  const DEFAULT_ACTION = 'signup';
  const CODE_TYPES = {
    sms: 'verifycode/sms',
    voice: 'verifycode/voice'
  };
  const CODE_TYPES_SMS_ACTION = {
    // 特殊文字验证码 action ,这里的 key 是 action 而不是 codeType
    recharge: 'verifycode/sms/recharge',
    withdraw: 'verifycode/sms/withdraw',
    buy: 'verifycode/sms/recharge',
    quickpay: 'verifycode/sms/recharge'
  };
  const DEFAULT_CODE_TYPE = 'sms';
  const DEFAULT_ERROR_MSG = ErrMsg.sendVerifyCodeError;
  const CAPTCHA_MAX_TRY_TIMES = 10;

  const { userId, ipAddress, platform } = ctx.args;
  const { isLogin } = ctx.state;

  const last = _.get(ctx.session, 'lastsms') - 0 || 0;
  const count = ~~ctx.session.captchacount || 0;
  const interval = 60 * 1000; // 60sec
  const now = Date.now();
  const query = {
    userId,
    ipAddress,
    platform
  };

  let action =
    ctx.checkBody('action').value ||
    ctx.checkParams('action').value ||
    ctx.state.action;
  let codeType = ctx.checkBody('type').value;
  let userMobile = isLogin && _.get(ctx.state, 'user.mobile', null);

  // 充值停用语音验证码
  if (codeType === 'voice' && (action === 'recharge' || action === 'buy')) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.unavailableVoiceSmsCode);
    return;
  }

  if (!action || action.length < 3) {
    ctx.dumpJSON(ErrorStatus.FAIL, DEFAULT_ERROR_MSG);
    return;
  }
  if (!action || !(action in ACTIONS)) {
    action = DEFAULT_ACTION;
  }
  let {
    shouldCheckMobile,
    shouldCheckCaptcha,
    shouldCheckAmount,
    type
  } = ACTIONS[action];

  let serviceAction;
  let tip;
  let values;
  let ret;

  // 验证码类型
  query.type = type;

  // captcha max try count
  if (shouldCheckCaptcha) {
    if (count > CAPTCHA_MAX_TRY_TIMES) {
      ctx.dumpJSON(ErrorStatus.CAPTCHA_EXPIRE);
      return;
    }
  } else {
    if (ctx.errors && count) {
      ctx.session.captchacount--;
    }
    // no need check captcha , clear captcha error
    ctx.errors = null;
  }
  // echo verifyCode error
  if (ctx.errors) {
    let error = ctx.getError();
    ctx.dumpJSON(ErrorStatus.FAIL, error.message);
    return;
  }
  // check time interval
  if (now - last < interval) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.quickSmsCode);
    return;
  }
  // 提交的mobile
  if (shouldCheckMobile) {
    query.mobile = ctx
      .checkBody('mobile')
      .notEmpty((tip = ErrMsg.isMobile))
      .match(util.reMobile, tip).value;
  } else if (userMobile) {
    // 用户的mobile
    query.mobile = userMobile;
  } else {
    ctx.throw(ErrorStatus.LOGIN_REQUIRED);
    return;
  }
  // validate err
  if (ctx.errors) {
    let error = ctx.getError();
    ctx.dumpJSON(ErrorStatus.FAIL, error.message);
    return;
  }
  // 金额
  if (shouldCheckAmount) {
    query.amount = ctx.checkBody('amount').notEmpty().value || 0;
  }
  // validate err
  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.FAIL, DEFAULT_ERROR_MSG);
    return;
  }

  if (!codeType || !(codeType in CODE_TYPES)) {
    codeType = DEFAULT_CODE_TYPE;
  }
  serviceAction = CODE_TYPES[codeType];
  // 某些文字验证码特殊的发送
  if (codeType === 'sms' && action in CODE_TYPES_SMS_ACTION) {
    serviceAction = CODE_TYPES_SMS_ACTION[action];
  }

  ctx.session.lastsms = now;
  try {
    values = await service.update(query, serviceAction);
    ret = values;
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

user.realname = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _data = getRealnameData.apply(ctx);
  _.extend(_data, ctx.args, {
    repeatCashPwd: _data.cashPassword
  });
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  if (_data.idNo && !util.isIdentityCode(_data.idNo)) {
    error.message = ErrMsg.isIdentity;
    ctx.body = error;
    return await next();
  }
  var _value = await ctx.proxy.setSecureAuth(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || {};
  ctx.body = success;
};

user.escrow = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _userInfo = _.get(ctx.state, 'userState', '');
  if (!_userInfo) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }

  var _isCreateEscrowAcc = _userInfo.isCreateEscrowAcc - 0,
    _isCashPassword = _userInfo.isCashPasswordPassed - 0,
    _isBindCard = _userInfo.hasBindCard - 0,
    _isRealname = _userInfo.isIdPassed - 0;

  if (_isCreateEscrowAcc && _isCashPassword && _isBindCard && _isRealname) {
    error.message = ErrMsg.isCreateEscrowAcc;
    ctx.body = error;
    return await next();
  }

  var _data = {
    name: !_isRealname
      ? ctx
          .checkBody('realName')
          .notEmpty(ErrMsg.emptyRealname)
          .match(util.reRealMinorityName, ErrMsg.isRealname)
          .trim().value
      : '',
    idNo: !_isRealname
      ? ctx
          .checkBody('identityCard')
          .notEmpty(ErrMsg.emptyIdentity)
          .len(18, 18, ErrMsg.isIdentity)
          .trim().value
      : '',
    cashPassword: !_isCashPassword
      ? ctx
          .checkBody('password')
          .notEmpty(ErrMsg.emptyPwd)
          .len(6, 6, ErrMsg.lenTradPwd)
          .match(util.reSms, ErrMsg.illegalPwd).value
      : '',
    cardNumber: !_isBindCard
      ? ctx
          .checkBody('bankCard')
          .notEmpty(ErrMsg.isBankIdEmpty)
          .trim().value
      : '',
    mobileNumInBank: !_isBindCard
      ? ctx
          .checkBody('bankReservedMobile')
          .notEmpty(ErrMsg.emptyMobile)
          .match(util.reMobile, ErrMsg.isMobile)
          .trim().value
      : '',
    bankCode: !_isBindCard
      ? ctx
          .checkBody('bankCode')
          .notEmpty(ErrMsg.isEmpTyBankNo)
          .trim().value
      : ''
  };
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  if (_data.idNo && !util.isIdentityCode(_data.idNo)) {
    error.message = ErrMsg.isIdentity;
    ctx.body = error;
    return await next();
  }
  _.extend(_data, ctx.args);
  var _value = await ctx.proxy.accountBindCardAndPerfectInfo(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);

  var _status = ret.status;
  if (_status !== 0) {
    error.status = _status === ErrorStatus.ESCROW_OVER_TIMES ? _status : 1;
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || {};
  ctx.body = success;
};

user.forgot = async(ctx, next) => {
  const { ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var code = _.get(ctx.session, 'captcha', '100000');
  var captcha = ctx
    .checkBody('captcha')
    .notEmpty(ErrMsg.emptyCaptcha)
    .trim()
    .toLowercase().value;
  var data = {
    mobile: ctx
      .checkBody('mobile')
      .trim()
      .notEmpty(ErrMsg.emptyMobile).value,
    smsCode: ctx
      .checkBody('smscode')
      .notEmpty(ErrMsg.emptyCode)
      .trim().value,
    code: ctx
      .checkBody('captcha')
      .trim()
      .notEmpty(ErrMsg.emptyCaptcha).value,
    type: 'RESETPASSWORD',
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  if (!captcha || code !== captcha) {
    delete ctx.session.captcha;
    error.message = ErrMsg.isCaptcha;
    ctx.body = error;
    return await next();
  }
  var _value = await ctx.proxy.checkSmsCode(data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  var _data = {
    mobile: data.mobile,
    password: ctx
      .checkBody('password')
      .trim()
      .notEmpty(ErrMsg.emptyNewPwd).value,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  _data.repeatPwd = _data.password;
  var _forgotData = await ctx.proxy.userForgotPost(_data);
  if (!_forgotData) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var _ret = JSON.parse(_forgotData);
  if (!_ret || _ret.status !== 0) {
    error.message = _ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data');
  ctx.body = success;
};

user.sendSmscodeBase = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var errMsg = ErrMsg.sendVerifyCodeError;
  var action = ctx.checkBody('action').value;
  var data;
  var last = _.get(ctx.session, 'lastsms', 0) - 0;
  var interval = 60 * 1000; // 60sec
  var _mobile = _.get(ctx.state, 'user.mobile');

  if (!action || action.length < 3) {
    error.message = errMsg;
    ctx.body = error;
    return await next();
  }

  // echo verifyCode error
  if (ctx.errors) {
    error.message = errMsg;
    ctx.body = error;
    return await next();
  }
  // check time interval
  if (Date.now() - last < interval) {
    error.message = ErrMsg.quickSmsCode;
    ctx.body = error;
    return await next();
  }

  data = {
    mobile: _mobile,
    type: util.smscode[action],
    userId,
    ipAddress,
    platform
  };

  // validate err
  if (ctx.errors) {
    error.message = errMsg;
    ctx.body = error;
    return await next();
  }

  // log verifyCode
  ctx.session.lastsms = Date.now();
  // TODO: check mobile not blacklist
  await ctx.proxy.sendValidateCode(data).then(
    function(value) {
      if (!value) {
        return;
      }
      var ret = JSON.parse(value);

      if (ret.status !== 0) {
        error.message = ret.message || errMsg;
        ctx.body = error;
        return;
      }
      success.data = _.get(ret, 'data');
      ctx.body = success;
    },
    function(error) {
      logger.error('user.VerifyCode.error', error);
      error.message = errMsg;
      ctx.body = error;
      return;
    }
  );
  await next();
};

user.checkIdentity = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _identity = ctx
    .checkBody('identity')
    .notEmpty(ErrMsg.emptyIdentity)
    .trim().value;
  if (ctx.errors) {
    ctx.body = error;
    return await next();
  }
  var _data = { idNo: _identity, userId, ipAddress, platform };
  var _value = await ctx.proxy.checkIdentityAuth(_data);

  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || [];
  ctx.body = success;
};

user.logout = async ctx => {
  const { userId, ipAddress, platform } = ctx.args;

  ctx.session.isLogin = false;
  ctx.session.user = null;
  if (ctx.session.loginUrl) {
    delete ctx.session.loginUrl;
  }
  if (ctx.session.nextUrl) {
    delete ctx.session.nextUrl;
  }
  await ctx.proxy
    .userLogout({ userId, ipAddress, platform })
    .then(function() {}, function() {});
  ctx.dumpJSON();
};

user.checkLoginPassword = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _pwd = ctx.checkBody('password').notEmpty(ErrMsg.emptyPassword).value;
  if (ctx.errors) {
    error.message = ErrMsg.emptyPassword;
    ctx.body = error;
    return await next();
  }
  var _data = {
    password: _pwd,
    userId,
    ipAddress,
    platform
  };
  var _value = await ctx.proxy.checkLoginPwd(_data);

  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || {};
  ctx.body = success;
};

user.riskModifyScore = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _score = ctx.checkBody('score').notEmpty(ErrMsg.isEmptyRiskScore).value;
  const option = ctx.checkBody('scoreDetail').value || '0, 0, 0, 0, 0, 0, 0, 0';
  if (ctx.errors) {
    error.message = ErrMsg.isEmptyRiskScore;
    ctx.body = error;
    return await next();
  }
  var _data = {
    score: _score,
    option,
    userId,
    ipAddress,
    platform
  };
  var _value = await ctx.proxy.accountRiskVail(_data);

  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || {};
  ctx.body = success;
};

user.checkCardBin = async ctx => {
  const CREDIT_CARD = 'credit';
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _bankCard = ctx
    .checkBody('bankCard')
    .notEmpty(ErrMsg.isBankIdEmpty)
    .trim().value;

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  var _data = {
    cardNo: _bankCard,
    userId,
    ipAddress,
    platform
  };
  await ctx.proxy.createAccountBankCardCheck(_data).then(
    function(value) {
      if (!value) {
        error.message = ErrMsg.def;
        ctx.body = error;
        return;
      }
      var ret = JSON.parse(value);
      if (ret.status !== 0) {
        error.message = ret.message;
        ctx.body = error;
        return;
      }

      var _cardType = _.get(ret, 'data.cardType', '');
      var _bankCode = _.get(ret, 'data.bankCode', '');
      success.data = _.assign(
        ret.data,
        {
          creditCard: _cardType.toLowerCase() === CREDIT_CARD ? true : false
        },
        getBankInfo(util.bankTips[_bankCode])
      );
      ctx.body = success;
    },
    function(err) {
      error.message = err.message || ErrMsg.def;
      ctx.body = error;
    }
  );
};

module.exports = user;
