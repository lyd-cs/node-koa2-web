'use strict';

/**
 * user model
 */
const utils = require('../lib/util');

function parseRiskType(score) {
  if (!score && score != 0) {
    return '立即评测';
  }
  score = ~~score || 0;
  if (score <= 14) {
    return '保守型';
  }
  if (score <= 36) {
    return '稳健型';
  }
  return '积极应对型';
}

// exports
module.exports = (model = {}) => {
  // risk type
  model.riskType = parseRiskType(model.riskEvaluationScore);

  // 最小充值金额
  model.minChargeAmount = utils.MIN_USER_CHARGE_AMOUNT;
  // 最小提现金额
  model.minWithdrawAmount = utils.MIN_USER_WITHDRAW_AMOUNT;

  // 是否有销售顾问
  model.isDisplayAdvisor = false;
  if (model.sourceValue) {
    model.isDisplayAdvisor = true;
  }

  // 员工还是销售
  model.isEmployee = model.inviteRole === 'EMPLOYEE';
  model.isSales = model.inviteRole === 'SALES';

  // 是否有邀请功能（销售顾问是卓越事业部的禁止邀请,没有销售顾问的正常邀请）
  model.isDisplayInvite = model.isShowInviteFriend
    ? !!(model.isShowInviteFriend - 0)
    : true;

  // promotion
  if (!model.promotion) {
    model.promotion = '';
  }
  return model;
};
