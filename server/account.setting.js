'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const ErrorStatus = require('../lib/status');

const { _, API_SUCCESS, API_ERROR } = util;

/**
 * get password
 */
function getPassword() {
  var ctx = this;
  var data = {
    password: ctx
      .checkBody('oldpwd')
      .notEmpty(ErrMsg.emptyPwd)
      .trim().value,
    newPassword: ctx
      .checkBody('newpwd')
      .notEmpty(ErrMsg.emptyNewPwd)
      .trim().value,
    ipAddress: ctx.ip
  };
  return data;
}

var setting = async(ctx, next) => {
  await next();
};

setting.password = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _passwordData = getPassword.call(ctx);
  var _data = _.extend(_passwordData, ctx.args, {
    repeatNewPassword: _passwordData.newPassword
  });
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  var _value = await ctx.proxy.accountChangePwd(_data);
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
  success.data = _.get(ret, 'data');
  ctx.body = success;
};

setting.checkSmsCode = async ctx => {
  const { userId, ipAddress, platform } = ctx.args;
  if (ctx.errors) {
    let error = ctx.getError();
    ctx.dumpJSON(ErrorStatus.FAIL, error.message);
    return;
  }
  var _mobile = _.get(ctx.state, 'user.mobile') || '';
  var _smsCode = ctx
    .checkBody('smscode')
    .notEmpty(ErrMsg.lenSmsCode)
    .trim().value;
  var _type = ctx.checkBody('type').trim().value;
  var _data = _.assign(
    { userId, ipAddress, platform },
    { mobile: _mobile, smsCode: _smsCode, type: util.smscode[_type] }
  );
  var _value = await ctx.proxy.checkSmsCode(_data);
  if (!_value) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.def);
    return;
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    ctx.dumpJSON(ErrorStatus.FAIL, ret.message);
    return;
  }
  ctx.dumpJSON(_.get(ret, 'data', {}));
};

setting.mobile = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _smsCode = ctx
    .checkBody('newsmscode')
    .notEmpty(ErrMsg.lenSmsCode)
    .trim().value;
  var _mobile = ctx
    .checkBody('mobile')
    .notEmpty(ErrMsg.emptyMobile)
    .trim().value;
  var _type = ctx.checkBody('action').value;
  var _data = _.assign(
    { userId, ipAddress, platform },
    { mobile: _mobile, smsCode: _smsCode, type: util.smscode[_type] }
  );
  var _value = await ctx.proxy.checkSmsCode(_data);
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

  var _mobileData = _.assign(
    { userId, ipAddress, platform },
    { mobile: _mobile }
  );
  var _mobileVal = await ctx.proxy.accountEditMobile(_mobileData);
  if (!_mobileVal) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var _mobileRet = JSON.parse(_mobileVal);
  if (!_mobileRet || _mobileRet.status !== 0) {
    error.message = _mobileRet.message;
    ctx.body = error;
    return await next();
  }
  success.data = _mobileRet.data;
  ctx.body = success;
};

setting.authentication = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _idCardNo = ctx
    .checkBody('idCardNo')
    .notEmpty(ErrMsg.emptyIdentity)
    .trim().value;
  var _username = ctx
    .checkBody('username')
    .notEmpty(ErrMsg.emptyRealname)
    .trim().value;
  var _data = {
    idNo: _idCardNo,
    name: _username,
    userId,
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
  var _value = await ctx.proxy.setUserRealName(_data);
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
  success.data = ret.data;
  ctx.body = success;
};

setting.setCashPassword = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  const { userId, ipAddress, platform } = ctx.args;
  var _cashpwd = ctx
    .checkBody('cashPassword')
    .notEmpty(ErrMsg.isEmptyTradPwd)
    .trim().value;
  var _data = {
    newCashPwd: _cashpwd,
    repeatCashPwd: _cashpwd,
    userId,
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
  var _value = await ctx.proxy.setUserTradPwd(_data);

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
  success.data = ret.data;
  ctx.body = success;
};

setting.editCashPassword = async ctx => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  const { userId, ipAddress, platform } = ctx.args;
  var _cashpwd = ctx
    .checkBody('cashPassword')
    .notEmpty(ErrMsg.isEmptyTradPwd)
    .trim().value;
  var _identity =
    ctx.checkBody('identity').notEmpty(ErrMsg.emptyIdentity).value || '';
  //var _smscode = ctx.checkBody('smscode').notEmpty(ErrMsg.isEmptySmsCode).value || '';
  //var _type = ctx.checkBody('action').notEmpty(ErrMsg.isEmptySmsCodeType).value;
  var _data = {
    newCashPwd: _cashpwd,
    repeatCashPwd: _cashpwd,
    userId,
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

  var _identityData = { idNo: _identity, userId, ipAddress, platform };

  await Promise.all([
    ctx.proxy.checkIdentityAuth(_identityData),
    //ctx.proxy.checkSmsCode(_smsData),
    ctx.proxy.accountResetTradPwd(_data)
  ]).then(
    function(values) {
      if (!values[0] || !values[1]) {
        error.message = ErrMsg.def;
        ctx.body = error;
        return;
      }
      var userIdentityAuth = JSON.parse(values[0]);
      var accountResetTradPwd = JSON.parse(values[1]);
      //var userSmscode = JSON.parse(values[1]);
      if (userIdentityAuth.status !== 0) {
        error.message = userIdentityAuth.message;
        ctx.body = error;
        return;
      }
      if (accountResetTradPwd.status !== 0) {
        error.message = accountResetTradPwd.message;
        ctx.body = error;
        return;
      }
      // if(userSmscode.status !== 0){
      //   error.message = userSmscode.message;
      //   ctx.body = error;
      //   return;
      // }
      success.data = {};
      ctx.body = success;
    },
    function(error) {
      error.message = ErrMsg.def;
      ctx.body = error;
      return;
    }
  );
};

setting.secureAuth = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _name = ctx.checkBody('name').notEmpty(ErrMsg.emptyRealname).value || '';
  var _idNo =
    ctx.checkBody('idCardNo').notEmpty(ErrMsg.emptyIdentity).value || '';
  var _cashPassword =
    ctx.checkBody('tradpwd').notEmpty(ErrMsg.emptyPwd).value || '';
  var _data = {
    name: _name,
    idNo: _idNo,
    cashPassword: _cashPassword,
    repeatCashPwd: _cashPassword,
    userId,
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
  success.data = ret.data;
  ctx.body = success;
};
setting.accountIdentitySmsCode = async ctx => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _identity = ctx.checkBody('identity').value || '';
  var _smscode =
    ctx.checkBody('smscode').notEmpty(ErrMsg.isEmptySmsCode).value || '';
  var _mobile = _.get(ctx.state, 'user.mobile');
  var _type = ctx.checkBody('action').notEmpty(ErrMsg.isEmptySmsCodeType).value;
  var _data = { idNo: _identity, userId, ipAddress, platform };
  var _smsData = {
    mobile: _mobile,
    smsCode: _smscode,
    type: util.smscode[_type],
    userId,
    ipAddress,
    platform
  };

  await Promise.all([
    ctx.proxy.checkIdentityAuth(_data),
    ctx.proxy.checkSmsCode(_smsData)
  ]).then(
    function(values) {
      if (!values[0] || !values[1]) {
        error.message = ErrMsg.def;
        ctx.body = error;
        return;
      }
      var userIdentityAuth = JSON.parse(values[0]);
      var userSmscode = JSON.parse(values[1]);
      if (userIdentityAuth.status !== 0) {
        error.message = userIdentityAuth.message;
        ctx.body = error;
        return;
      }
      if (userSmscode.status !== 0) {
        error.message = userSmscode.message;
        ctx.body = error;
        return;
      }
      delete ctx.session.lastsms;
      success.data = {};
      ctx.body = success;
    },
    function(error) {
      error.message = ErrMsg.def;
      ctx.body = error;
      return;
    }
  );
};

module.exports = setting;
