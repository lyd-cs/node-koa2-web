'use strict';

/**
 * invite model
 **/
const { safeRealname, safeMobile } = require('../lib/util');

const DEFAULT_REAL_NAME = '未实名';

// exports
module.exports = (model = {}) => {
  //const couponAmount = (model.couponAmount - 0) || 0;
  const couponCount = model.couponCount || 0;
  const cashBackAmount = model.directlyCashBackAmount - 0 || 0;
  const indirectCashBackAmount = model.indirectCashBackAmount - 0 || 0;
  const realName = model.invitedRealName || null;
  const mobile = model.invitedUserPhoneNo;
  let rewardTextList = [];
  let totalCashBackAmount = cashBackAmount + indirectCashBackAmount;

  if (couponCount) {
    rewardTextList.push(`${couponCount}张优惠券`);
  }

  if (totalCashBackAmount) {
    rewardTextList.push(`${totalCashBackAmount.toFixed(2)}元现金奖励`);
  }
  //model.rewardDesc = `${couponAmount}元红包，${cashBackAmount}元直接返现，${indirectCashBackAmount}元间接返现`;
  model.rewardDesc = rewardTextList.join(',');
  //model._invitedRealName = model.invitedRealName;
  model.invitedRealName = DEFAULT_REAL_NAME;
  if (realName) {
    model.invitedRealName = safeRealname(realName);
  }
  model.invitedUserPhoneNo = safeMobile(mobile);
  return model;
};
