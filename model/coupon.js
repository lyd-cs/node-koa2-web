'use strict';

/**
 * coupon model
 **/
const TYPE = {
  MONEY_OFF: '满减券',
  DISCOUNT: '抵扣券'
};
const STATUS = {
  AVAILABLE: '未使用',
  FROZEN: '冻结中',
  USED: '已使用',
  DISABLED: '已作废'
};
const UNMATCH_TEXT = '';
const LOAN_TEXT = '散标';
const TRANSFER_TEXT = '债权';
const PLAN_TEXT = '红利智投';
// const PLAN_FULL_TEXT = '全部计划';

// find key in object
function find(obj, key) {
  return (key && obj[key]) || UNMATCH_TEXT;
}

// parse limit str to Object
function parseLimit(str) {
  // #FIXME null 代表所有都可用,奇怪的后端设计
  if (str === null) {
    return {
      loan: true,
      transfer: true,
      planFull: true
    };
  }
  let arr = str.split(',');
  let regexp = /^F(\d+)$/;
  let data = {
    loan: false,
    transfer: false,
    planFull: false,
    planList: []
  };
  arr.forEach(ele => {
    let ret;
    if (ele == 'LOAN') {
      data.loan = true;
    } else if (ele == 'LOAN_TRANSFER') {
      data.loan_transfer = true;
    } else if (ele == 'FALL') {
      data.planFull = true;
    } else if ((ret = regexp.exec(ele)) && ret) {
      data.planList.push(ret[1]);
    }
  });
  return data;
}

// exports
module.exports = (model = {}) => {
  const limit = parseLimit(model.allowBusinessCategory || '');
  const used = parseLimit(model.businessCategory || '');
  const limitText = [];

  const discount = model.dicountRate - 0 || 0; // 折扣
  const reduction = model.derateAmount - 0 || 0; // 减免
  const reductionLimt = model.allowDerateInvest - 0 || 0; // 满减券 满额限制
  const minInvestAmount = model.minInvestAmount - 0 || 0; // 抵扣最少投资金额
  const maxDiscountAmount = model.maxDiscountAmount - 0 || 0; // 抵扣最多抵扣金额

  const couponType = model.couponType;
  const couponTypeText = find(TYPE, couponType);

  //region for product
  // region 如果是全部计划或者分期的计划
  model.isForPlan = limit.planFull || !!limit.planList.length;
  model.isForLoan = limit.loan;
  model.isForTransfer = limit.transfer;
  if (model.isForLoan) {
    limitText.push(LOAN_TEXT);
  }
  if (model.isForTransfer) {
    limitText.push(TRANSFER_TEXT);
  }
  if (model.isForPlan) {
    limitText.push(PLAN_TEXT);
  }
  model.forProductText = limitText.join(' ');
  if (limit.planFull) {
    model.forProductLimit = '';
    model.forProductPeriodLimit = ['ALL'];
  } else if (limit.planList.length) {
    model.forProductLimit = `(${limit.planList.join('/')}个月)`;
    model.forProductPeriodLimit = limit.planList;
  } else {
    model.forProductLimit = '';
    model.forProductPeriodLimit = [];
  }
  // endregion
  model.isUsedForPlan = used.planFull || !!used.planList.length;
  model.isUsedForLoan = used.loan;
  model.isUsedForTransfer = used.transfer;
  //endregion

  model.couponTypeText = couponTypeText;
  model.statusText = find(STATUS, model.status);
  // 扣减金额，满减券时候使用 derateAmount
  if (!model.valueActual) {
    model.valueActual = model.derateAmount || UNMATCH_TEXT;
  }
  model.dicountSummaryTitle = '';
  model.dicountMinInvestDesc = '';
  //region 选择优惠券页 标题,子标题,兑换成功页提示
  // region 抵扣券
  if (couponType == 'DISCOUNT') {
    // 6%抵扣券
    model.summaryTitle = `${discount}%${couponTypeText}`;
    // 抵扣券:500元使用，最高100元
    model.summarySubtitle = `满${minInvestAmount}元使用，最高${maxDiscountAmount}元`;
    // 抵扣券：1%抵扣，最高666元的抵扣券
    model.summaryContent = `${discount}%抵扣，最高${maxDiscountAmount}元的抵扣券`;
    // 抵扣券：200元抵扣券
    model.dicountSummaryTitle = `${maxDiscountAmount}元${couponTypeText}`;
    model.dicountMinInvestDesc = `满${minInvestAmount}元使用`;
    // “满xxx元使用”在没有设置最小投资金额或者设置为0时不显示
    if (!minInvestAmount) {
      model.summarySubtitle = `最高${maxDiscountAmount}元`;
      model.dicountMinInvestDesc = '使用无门槛';
    }
  }
  // endregion
  // region 满减券
  else if (couponType == 'MONEY_OFF') {
    //30元满减券
    model.summaryTitle = `${reduction}元${couponTypeText}`;
    // 满减券: 满10000元使用
    model.summarySubtitle = `满${reductionLimt}元使用`;
    // 满减券：满5000元减20元的满减券
    model.summaryContent = `满${reductionLimt}元减${reduction}元的${couponTypeText}`;
  }
  // endregion
  //endregion

  return model;
};
