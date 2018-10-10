'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const { _, parseUserAgent, versionCompare } = util;
const share = require('./share');
const UserModel = require('../model/user');

const account = async(ctx, next) => {
  await next();
};

account.planAgreement = async(ctx, next) => {
  const service = ctx.service.account;
  const { userId, platform, ipAddress } = ctx.args;

  const id = ctx
    .checkParams('id')
    .notEmpty(ErrMsg.isProductEmptyId)
    .trim()
    .isInt(ErrMsg.isProductIdInt)
    .toInt().value;

  let action = ctx.checkParams('action').trim().value;
  const isMonthlyPaymentsPlan = {
    plan: false,
    planMonth: true
  };
  action = action in isMonthlyPaymentsPlan ? action : 'plan';
  isMonthlyPaymentsPlan[action] && (ctx.state.isMonthlyPaymentsPlan = true);
  const query = {
    financePlanId: id,
    userId,
    platform,
    ipAddress
  };

  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }

  let ret;
  try {
    ret = await service.fetch(query, 'accountPlanAgreement');
    ctx.state.agreementData = ret;
  } catch (error) {
    ctx.addError('page', error._message || ErrMsg.def);
  }
  await next();
};

account.loanAgreement = async(ctx, next) => {
  const service = ctx.service.account;
  const { userId, ipAddress, platform } = ctx.args;

  const id = ctx
    .checkParams('id')
    .notEmpty(ErrMsg.isProductEmptyId)
    .trim()
    .isInt(ErrMsg.isProductIdInt)
    .toInt().value;

  const query = {
    loanId: id,
    userId,
    ipAddress,
    platform
  };

  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }

  let ret;
  try {
    ret = await service.fetch(query, 'accountLoanAgreement');
    Object.assign(ctx.state, {
      agreementData: ret,
      agreementUserID: userId
    });
  } catch (error) {
    ctx.addError('page', error._message || ErrMsg.def);
  }
  await next();
};

account.invite = async(ctx, next) => {
  const { isLogin, userId, ipAddress, platform } = ctx.args;

  const ACTIONS = {
    customerInvite: 'customerInvite',
    salesInvite: 'salesInvite'
  };

  const sellerTpl = './mobile/account.invite.seller.pug';
  const userAgent = ctx.get('x-hxb-user-agent');
  const { version } = parseUserAgent(userAgent);
  const minVersion = '2.3.0';
  const hasUpgradeMsg = versionCompare(version, minVersion) < 0;

  if (!isLogin) {
    Object.assign(ctx.state, {
      hasUpgradeMsg,
      isCustomerDisplay: true
    });
    return await next();
  }
  const query = {
    userId,
    ipAddress,
    platform
  };
  const { isCreateEscrowAcc, inviteRole, isSales, isDisplayInvite } = UserModel(
    ctx.state.userState
  );
  const action = isSales ? ACTIONS.salesInvite : ACTIONS.customerInvite;

  let ret, inviteReward, staffId, shareId;
  !isSales &&
    (await ctx.proxy.inviteInfo(query).then(
      function(value) {
        if (!value) {
          ctx.addError('invite', ErrMsg.def);
        }
        ret = JSON.parse(value);
        if (ret.status !== 0) {
          ctx.addError('invite', ret.message);
        }
        inviteReward = _.get(ret, 'data', {});
      },
      function() {
        inviteReward = '';
      }
    ));

  isSales &&
    (await ctx.proxy.getEmployeeId(query).then(
      function(value) {
        if (!value) {
          ctx.addError('salesInvite', ErrMsg.def);
        }
        ret = JSON.parse(value);
        if (ret.status !== 0) {
          ctx.addError('salesInvite', ret.message);
        }
        staffId = _.get(ret.data, 'employeeId', '') - 0;
      },
      function() {
        staffId = 0;
      }
    ));
  shareId = isSales ? staffId : userId;
  Object.assign(ctx.state, {
    shareData: JSON.stringify(share(shareId, ACTIONS[action])),
    hasUpgradeMsg
  });
  if (isSales) {
    Object.assign(ctx.state, {
      tpl: sellerTpl,
      staffId,
      isSalesDisplay: isSales
    });
  } else {
    Object.assign(ctx.state, {
      inviteReward,
      isCreateEscrowAcc,
      hasNativeShowMsg: isSales || !inviteRole,
      isCustomerDisplay: !isSales,
      isDisplayInvite
    });
  }
  await next();
};

module.exports = account;
