'use strict';
const url = require('url');
const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');

const { _, AJAX_ERROR, AJAX_SUCCESS } = util;

const HTTP_POST = 'POST';

/**
 * get secure
 */
function getSecureData() {
  var ctx = this;
  var data = {
    name: ctx.checkBody('name').value || '',
    idNo: ctx.checkBody('idNo').value || '',
    cashPassword: ctx.checkBody('tradpwd').value || '',
    repeatCashPwd: ctx.checkBody('tradrepwd').value || '',
    ipAddress: ctx.ip
  };
  //data.realName = data.name;
  //data.idCardNumber = data.identity;
  return data;
}
/**
 * get password
 */
function getPassword() {
  var ctx = this;
  var data = {
    password: ctx
      .checkBody('oldpwd')
      .trim()
      .notEmpty(ErrMsg.emptyPwd).value,
    newPassword: ctx
      .checkBody('newpwd')
      .trim()
      .notEmpty(ErrMsg.emptyNewPwd).value,
    repeatNewPassword: ctx
      .checkBody('renewpwd')
      .trim()
      .notEmpty(ErrMsg.emptyReNewPwd).value,
    ipAddress: ctx.ip
  };
  return data;
}
const setting = async(ctx, next) => {
  await next();
};
setting.home = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  ctx.state.bankList = util.bankTips;
  var _data = {
    userId,
    ipAddress,
    platform
  };

  await Promise.all([
    ctx.proxy.accountWithDrawUserCard(_data),
    ctx.proxy.accountInviteCode(_data)
  ]).then(
    function(values) {
      if (!values[0] || !values[1]) {
        ctx.addError('page', ErrMsg.def);
        return;
      }

      var accountUserCardInfo = JSON.parse(values[0]);
      _.assign(ctx.state, {
        userCard:
          (values[0] && _.get(accountUserCardInfo, 'data.userBank')) || '',
        userInviteInfo: _.get(JSON.parse(values[1]), 'data'),
        isEnableUnbind:
          (values[0] && _.get(accountUserCardInfo, 'data.enableUnbind')) || '',
        isEnableUnbindReason:
          (values[0] &&
            _.get(accountUserCardInfo, 'data.enableUnbindReason')) ||
          ''
      });
    },
    function() {}
  );
  await next();
};

setting.secure = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var method = ctx.method;
  var data;
  var isAllPassed = _.get(ctx.state, 'userState.isAllPassed', 0) - 0;
  var isTrusted = _.get(ctx.state, 'userState.isIdPassed', 0) - 0;
  var isTradPwd = _.get(ctx.state, 'userState.isCashPasswordPassed', 0) - 0;
  var _render = function() {
    ctx.state.isTrusted = isTrusted;
    ctx.state.query = data;
    ctx.state.errors = ctx.errors;
  };
  if (isAllPassed) {
    ctx.redirect('/account/setting');
  }
  if (method === 'POST') {
    var _secureData = getSecureData.call(ctx);
    data = _.extend(_secureData, {
      userId,
      ipAddress,
      platform
    });
    if (data.tradpwd && data.tradpwd !== data.tradrepwd) {
      ctx.addError('tradrepwd', ErrMsg.rePwd);
      _render();
      return await next();
    }
    if (ctx.errors) {
      _render();
      return await next();
    }
    if (data.idNo && !util.isIdentityCode(data.idNo)) {
      ctx.addError('identity', ErrMsg.isIdentity);
      _render();
      return await next();
    }
    try {
      if (!isTrusted && !isTradPwd) {
        await ctx.proxy.setSecureAuth(data).then(
          function(value) {
            if (!value) {
              ctx.throw(ErrMsg.def);
            }
            var ret = JSON.parse(value);
            if (ret.status !== 0) {
              ctx.throw(ret.message);
            }
            ctx.redirect('/account/setting');
          },
          function(error) {
            ctx.throw(error);
          }
        );
      } else if (!isTrusted && isTradPwd) {
        await ctx.proxy.setUserRealName(data).then(
          function(value) {
            if (!value) {
              ctx.throw(ErrMsg.def);
            }
            var ret = JSON.parse(value);
            if (ret.status !== 0) {
              ctx.throw(ret.message);
            }
            ctx.redirect('/account/setting');
          },
          function(error) {
            ctx.throw(error);
          }
        );
      } else if (isTrusted && !isTradPwd) {
        var _tradPwdData = {
          newCashPwd: data.cashPassword,
          repeatCashPwd: data.repeatCashPwd,
          userId,
          ipAddress,
          platform
        };
        await ctx.proxy.setUserTradPwd(_tradPwdData).then(
          function(value) {
            if (!value) {
              ctx.throw(ErrMsg.def);
            }
            var ret = JSON.parse(value);
            if (ret.status !== 0) {
              ctx.throw(ret.message);
            }
            ctx.redirect('/account/setting');
          },
          function(error) {
            ctx.throw(error);
          }
        );
      }
    } catch (error) {
      ctx.addError('page', error.message);
      _render();
      return await next();
    }
  }
  _render();
  await next();
};
setting.mobile = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var _step = 'identity';
  var data;
  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = data;
    ctx.state.step = _step;
  };
  if (ctx.method === HTTP_POST) {
    const step = ctx.checkBody('action').value || 'identity';
    if (ctx.errors) {
      _step = step;
      _render();
      return await next();
    }
    if (step === 'identity') {
      var _userIdc = ctx.checkBody('identity').value;
      var _smsCode = ctx
        .checkBody('smscode')
        .notEmpty(ErrMsg.lenSmsCode)
        .trim().value;
      var _user = await ctx.cache.user.get_state(userId);
      var _mobile = _.get(_user, 'mobile') || _.get(ctx.state, 'user.mobile');
      var _type = ctx.checkBody('type').trim().value;
      var _data = {
        mobile: _mobile,
        smsCode: _smsCode,
        type: util.smscode[_type],
        userId,
        ipAddress,
        platform
      };
      data = _.extend(data, {
        identity: _userIdc
      });
      await ctx.proxy.checkSmsCode(_data).then(function(value) {
        if (!value) {
          _step = 'identity';
          ctx.addError('page', ErrMsg.def);
          _render();
          return;
        }
        var ret = JSON.parse(value);
        if (!ret || ret.status !== 0) {
          _step = 'identity';
          ctx.addError('page', ret.message);
          _render();
          return;
        }
        _step = 'newmobile';
        _render();
      });
      delete ctx.session.lastsms;
      return await next();
    } else if (step === 'newmobile') {
      var _smsCode = ctx
        .checkBody('newsmscode')
        .notEmpty(ErrMsg.lenSmsCode)
        .trim().value;
      var _mobile = ctx
        .checkBody('mobile')
        .notEmpty(ErrMsg.emptyMobile)
        .trim().value;
      var _type = ctx.checkBody('action').value;
      if (ctx.errors) {
        _step = 'newmobile';
        _render();
        return await next();
      }
      var _data = {
        mobile: _mobile,
        smsCode: _smsCode,
        type: util.smscode[_type],
        userId,
        ipAddress,
        platform
      };
      data = _.extend(data, {
        mobile: _mobile,
        newsmscode: _smsCode
      });
      await ctx.proxy.checkSmsCode(_data).then(function(value) {
        if (!value) {
          _step = 'newmobile';
          _render();
          ctx.addError('page', ErrMsg.def);
          return;
        }
        var ret = JSON.parse(value);
        if (ret.status !== 0) {
          _step = 'newmobile';
          _render();
          ctx.addError('page', ret.message);
          return;
        }
      });
      if (ctx.errors) {
        _step = 'newmobile';
        _render();
        return await next();
      }
      await ctx.proxy
        .accountEditMobile({
          mobile: _mobile,
          userId,
          ipAddress,
          platform
        })
        .then(
          function(value) {
            if (!value) {
              _step = 'newmobile';
              _render();
              ctx.addError('page', ErrMsg.def);
              return;
            }
            var ret = JSON.parse(value);
            if (!ret || ret.status !== 0) {
              _step = 'newmobile';
              ctx.addError('page', ret.message);
              _render();
              return;
            }
            _step = 'result';
            ctx.state.isResult = 1;
            ctx.session.user.mobile = _mobile;
            _render();
          },
          function() {}
        );
      return await next();
    }
  }
  _render();
  await next();
};
setting.password = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var _render = function() {
    ctx.state.errors = ctx.errors || [];
  };
  if (ctx.method === HTTP_POST) {
    var _data = _.extend(getPassword.call(ctx), {
      userId,
      ipAddress,
      platform
    });
    if (ctx.errors) {
      _render();
      return await next();
    }
    try {
      await ctx.proxy.accountChangePwd(_data).then(
        function(value) {
          if (!value) {
            ctx.throw(ErrMsg.def);
          }
          var ret = JSON.parse(value);
          if (ret.status !== 0) {
            ctx.throw(ret.message);
          }
          ctx.redirect('/account/setting');
        },
        function(error) {
          ctx.throw(error);
        }
      );
    } catch (error) {
      ctx.addError('page', error.message);
      return await next();
    }
  }
  _render();
  await next();
};
setting.tradPassword = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var _step = 'identity';
  var queryData;
  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = queryData;
    ctx.state.step = _step;
  };
  if (ctx.method === HTTP_POST) {
    const step = ctx.checkBody('action').value || 'identity';
    if (ctx.errors) {
      _step = step;
      _render();
      return await next();
    }
    if (step === 'identity') {
      var _smsCode = ctx
        .checkBody('smscode')
        .notEmpty(ErrMsg.lenSmsCode)
        .trim().value;
      var _identity = ctx.checkBody('identity').value;
      var _mobile = _.get(ctx.state, 'user.mobile') || '';
      var _type = ctx.checkBody('type').trim().value;
      var _data = {
        mobile: _mobile,
        smsCode: _smsCode,
        type: util.smscode[_type],
        userId,
        ipAddress,
        platform
      };
      queryData = {
        identity: _identity,
        smscode: _smsCode
      };
      await ctx.proxy.checkSmsCode(_data).then(function(value) {
        if (!value) {
          _step = 'identity';
          ctx.addError('page', ErrMsg.def);
          _render();
          return;
        }
        var ret = JSON.parse(value);
        if (!ret || ret.status !== 0) {
          _step = 'identity';
          ctx.addError('page', ret.message);
          _render();
          return;
        }
        _step = 'newPwd';
        _render();
      });
      return await next();
    } else if (step === 'newPwd') {
      var _newTradPwd = ctx
        .checkBody('newtradpwd')
        .notEmpty(ErrMsg.isEmptyTradPwd)
        .trim().value;
      var _reTradPwd = ctx
        .checkBody('retradpwd')
        .notEmpty(ErrMsg.isEmptyTradPwd)
        .trim().value;
      if (_newTradPwd !== _reTradPwd) {
        ctx.addError('page', ErrMsg.rePwd);
        _step = 'newPwd';
        _render();
        return await next();
      }
      if (ctx.errors) {
        _step = 'newPwd';
        _render();
        return await next();
      }
      var _data = {
        newCashPwd: _newTradPwd,
        repeatCashPwd: _reTradPwd,
        userId,
        ipAddress,
        platform
      };
      await ctx.proxy.accountResetTradPwd(_data).then(function(value) {
        if (!value) {
          _step = 'newPwd';
          _render();
          ctx.addError('page', ErrMsg.def);
          return;
        }
        var ret = JSON.parse(value);
        if (!ret || ret.status !== 0) {
          _step = 'newPwd';
          _render();
          ctx.addError('page', ret.message);
          return;
        }
        _step = 'result';
        ctx.state.isResult = 1;
        _render();
      });
      return await next();
    }
  }
  _render();
  await next();
};
setting.riskvail = async(ctx, next) => {
  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  const { userId, ipAddress, platform } = ctx.args;

  var _score = ctx
    .checkBody('score')
    .notEmpty(ErrMsg.def)
    .trim().value;
  var _data = {
    score: _score,
    option: ctx.checkBody('scoreDetail').value || '',
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    err.message = ctx.errors[0].score;
    ctx.body = err;
    return await next();
  }
  await ctx.proxy.accountRiskVail(_data).then(function(value) {
    if (!value) {
      err.message = ctx.errors;
      ctx.body = err;
      return;
    }
    var result = JSON.parse(value);
    if (result.status != 0) {
      ctx.body = err;
      return;
    }
    ctx.body = success;
  });
  await next();
};
setting.lastPageUrl = async(ctx, next) => {
  var _reUrl = ctx.get('Referer');
  var refereUrl = url.parse(_reUrl).pathname;
  ctx.state.reurl = refereUrl;
  await next();
};
setting.inviteCode = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var data;
  var _render = function() {
    ctx.state.query = data;
    ctx.state.errors = ctx.errors;
  };
  if (ctx.method === HTTP_POST) {
    var _code = ctx.checkBody('code').notEmpty(ErrMsg.isEmptyInviteCode).value;
    data = {
      investCode: _code,
      userId,
      ipAddress,
      platform
    };
    if (ctx.errors) {
      _render();
      return await next();
    }
    var value = await ctx.proxy.accountSettingInvite(data);
    if (!value) {
      ctx.addError('page', ErrMsg.def);
      _render();
      return await next();
    }
    var ret = JSON.parse(value);
    if (!ret || ret.status !== 0) {
      ctx.addError('page', ret.message);
      _render();
      return await next();
    }
    ctx.state.settingInviteCodeSuccess = 1;
    ctx.state.tpl = 'account.invite.code.result.pug';
  }
  await next();
};
module.exports = setting;
