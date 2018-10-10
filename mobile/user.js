'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const ErrorStatus = require('../lib/status');

const { _ } = util;

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
      .notEmpty(ErrMsg.emptyPwd)
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

const user = async(ctx, next) => {
  await next();
};

user.assignInfo = async(ctx, next) => {
  await next();
};

user.signupPost = async(ctx, next) => {
  const service = ctx.service;
  let data, checkSmsData;
  const SIGNUP_ACTION = 'signup';
  const ACTIONS = {
    inviteRegister: {
      shouldCheckCaptcha: false,
      shouldCheckInviteCode: false,
      shouldCheckInviteSerial: true,
      shouldReturnHtml: false
    },
    signup: {
      shouldCheckCaptcha: true,
      shouldCheckInviteCode: true,
      shouldCheckInviteSerial: false,
      shouldReturnHtml: true
    },
    carnival: {
      shouldCheckCaptcha: false,
      shouldCheckInviteCode: false,
      shouldCheckInviteSerial: false,
      shouldReturnHtml: false
    }
  };
  data = getSignupData.apply(ctx);
  const { ipAddress, platform, utmSource } = ctx.args;

  checkSmsData = {
    mobile: data.mobile,
    smsCode: data.smscode,
    type: util.smscode[SIGNUP_ACTION],
    ipAddress,
    platform
  };

  _.extend(data, {
    platform,
    sessionId: ctx.sessionId,
    version: '1.0',
    isFromMobile: false,
    ipAddress,
    utmSource,
    repeatPassword: ctx
      .checkBody('password')
      .notEmpty(ErrMsg.emptyPwd)
      .len(8, 20, ErrMsg.lenPwd)
      .match(util.checkPassword, ErrMsg.purePwd)
      .trim().value
  });
  let action = ctx.checkBody('action').value;
  if (!action || !(action in ACTIONS)) {
    action = SIGNUP_ACTION;
  }
  let {
    shouldCheckCaptcha,
    shouldCheckInviteCode,
    shouldCheckInviteSerial,
    shouldReturnHtml
  } = ACTIONS[action];

  data.smsCode = checkSmsData.smsCode;
  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.FAIL);
    return;
  }
  if (shouldCheckInviteCode) {
    data.sourceValue = ctx
      .checkBody('inviteCode')
      .notEmpty(ErrMsg.isEmptyInviteCode)
      .trim().value;
  }
  //data.repeatPassword = ctx.checkBody('password').notEmpty(ErrMsg.emptyPwd).len(8, 20, ErrMsg.lenPwd).match(util.checkPassword, ErrMsg.purePwd).trim().value;
  //data.utmSource = ctx.checkBody('utmSource').value;
  if (shouldCheckCaptcha) {
    data.captcha = ctx
      .checkBody('captcha')
      .notEmpty(ErrMsg.emptyCaptcha)
      .trim().value;
  }
  if (shouldCheckInviteSerial) {
    data.inviteSerial = ctx.checkBody('inviteSerial').value;
  }
  try {
    await service.user.fetch(checkSmsData, 'verifycode/check');
  } catch (error) {
    ctx.dumpJSON(error._status, error._message || ErrMsg.def, ctx.getErrors());
    return;
  }
  try {
    await service.user.fetch(data, 'userSignupPost');
    if (!shouldReturnHtml) {
      ctx.dumpJSON();
      return;
    }
  } catch (error) {
    ctx.dumpJSON(error._status, error._message || ErrMsg.def, ctx.getErrors());
    return;
  }
  ctx.dumpJSON();
  await next();
};

user.checkMobile = async ctx => {
  // var _usermobile = getMobile.call(ctx);
  const service = ctx.service;
  const { ipAddress, platform } = ctx.args;
  const query = {
    mobile: getMobile.call(ctx),
    ipAddress,
    platform
  };
  let ret;
  try {
    ret = await service.user.query(query, 'userCheckMobile');
  } catch (error) {
    ctx.body = false;
    return;
  }
  if (!ret || ret.exist != 0) {
    ctx.body = false;
    return;
  }
  ctx.body = true;
};

// verify captcha
user.verifyCaptcha = async(ctx, next) => {
  const action = ctx.checkBody('action').value || '';
  if (action && action === 'inviteRegister') {
    return await next();
  }
  if (action && action === 'carnival') {
    return await next();
  }
  ctx.session.captchacount = ctx.session.captchacount || 1;
  ctx.session.captchacount++;
  var code = _.get(ctx.session, 'captcha', '100000');
  var captcha = ctx
    .checkBody('captcha')
    .notEmpty(ErrMsg.lenCaptcha)
    .trim()
    .toLowercase().value;

  if (ctx.errors || code !== captcha) {
    ctx.addError('captcha', ErrMsg.isCaptchaCorrect);
    return await next();
  }

  await next();
};

user.ajaxWeixinSign = async ctx => {
  const service = ctx.service;

  const data = {
    url: ctx
      .checkBody('url')
      .trim()
      .notEmpty().value,
    ipAddress: ctx.ip
  };
  let ret;
  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.FAIL);
    return;
  }
  try {
    ret = await service.user.fetch(data, 'getWechatSignature');
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  if (!ret) {
    ctx.dumpJSON(ErrorStatus.FAIL);
    return;
  }

  ctx.dumpJSON(ret);
};

module.exports = user;
