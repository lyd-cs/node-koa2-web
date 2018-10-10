'use strict';

/**
 * plan model
 */
const { moment } = require('../lib/helper');

const {
  parsePlanCashType,
  parsePlanCashTypeApp,
  parseAccountPlanListCashDrawDay,
  extendLockPeriod
} = require('../lib/util');

// 账户内计划详情副标题
function quitSubTitle(quitWay = '', cancelQuitDate) {
  const quitSubTitleMap = {
    QUIT: '继续持有依然可以享受收益',
    ANNUL_QUIT: `${moment(cancelQuitDate).format(
      'YYYY-MM-DD'
    )}(不含)前可撤销退出 `
  };
  return quitSubTitleMap[quitWay];
}

// 账户内计划列表状态
const statusDescMap = {
  PURCHASEING: '债权匹配中',
  PURCHASE_END: '锁定期',
  REDEMPTION_PERIOD: '开放期'
};

// 账户内详情取消购买描述
const cancelBuyDesc = '继续持有进入锁定期后可享受收益';

// 账户内计划列表详情(ID<=670)
const OLD_PLAN = 'OLD';

// 账户外老计划计划ID分界线
const OLD_PLAN_ID = 675;
// const FEATURED_SLOGAN = '整存整取';
// const MAX_LEN_SLOGAN = 4;
// const ELLIPSIS_SLOGAN = '...';

// exports
module.exports = (model = {}) => {
  const now = Date.now();

  let start = model.beginSellingTime - 0 || 0;
  let end = model.endLockingTime - 0 || 0;

  let factor = 100;
  let baseRate = Number(model.expectedRate) || 0;
  let extraRate = Number(model.subsidyInterestRate) || 0;
  let totalExpectedRate =
    (parseInt(baseRate * factor, 10) + parseInt(extraRate * factor, 10)) /
    factor;

  const isNewbie = Number(model.novice) ? true : false;

  // 首页的是时间戳，列表是日期字符串
  // ~~ 不能用于时间戳，~~上限2147483647,
  if (!start && model.beginSellingTime) {
    start = moment(model.beginSellingTime).format('x');
  }
  // 存储原始数据
  //model._beginSellingTime = model.beginSellingTime;
  // 开售时间
  //model.beginSellingTime = start.toString();
  // 倒计时时间
  model.diffTime = start - now;
  // 推荐slogan
  // model.featuredSlogan = cutStr(FEATURED_SLOGAN, MAX_LEN_SLOGAN, ELLIPSIS_SLOGAN);
  model.featuredSlogan = parsePlanCashTypeApp(model.cashType || 'INVEST');
  // 是否有优惠券
  model.hasDiscountCoupon = !!model.showDiscount;
  model.hasMoneyOffCoupon = !!model.showMoneyOff;
  // lastdays
  model.lastDays = moment(end).diff(now, 'days');
  //提取收益类型文案
  model.incomeApproach = parsePlanCashType(model.cashType);
  // 按月提取收益日
  if (model.cashDrawDay) {
    model.interestDate = parseAccountPlanListCashDrawDay(model.cashDrawDay);
  }
  // 计划退出button副标题
  if (model.quitStatus) {
    model.quitSubTitle =
      quitSubTitle(model.quitStatus, model.repealDate - 0) || '';
  }
  // 计划退出时间2.6.0新旧计划兼容都取quitDate
  if (model.financePlanStatus && model.financePlanStatus === OLD_PLAN) {
    model.quitDate = model.endLockingTime;
  }
  // 账户内计划列表状态描述
  if (model.status && statusDescMap[model.status]) {
    model.statusDesc = statusDescMap[model.status];
  }
  // 账户内计划详情取消购买副标题
  if (model.inCoolingOffPeriod) {
    model.cancelBuyDesc = cancelBuyDesc;
  }
  // 账户外首页、计划列表、详情接口等新增extendLockPeriod字段（24 — 36个月）
  model.extendLockPeriod =
    model.id - 0 > OLD_PLAN_ID
      ? `${extendLockPeriod(model.lockPeriod, model.cashType)['month']}`
      : model.lockPeriod;

  // 账户内计划列表、详情，计划冷静期设为0分时，后台inCoolingOffPeriod字段仍为ture的bug（根据coolingOffPeriod的值进行改造）
  if (model.inCoolingOffPeriod && !(model.coolingOffPeriod - 0)) {
    model.inCoolingOffPeriod = !model.inCoolingOffPeriod;
  }

  // 账户内计划列表及详情添加tips
  if (
    isNewbie &&
    model.expectedRate &&
    model.subsidyInterestRate &&
    model.expectedSubsidyInterestAmount
  ) {
    //-${((model.expectedSubsidyInterestAmount *(model.finalAmount || model.amount)) /100).toFixed(2)}
    model.newbieEarningsTips = `计划按照${model.expectedRate}%计息, ${
      model.subsidyInterestRate
    }%的加息收益（预计${model.subsidyInterest}元）将在计划退出时返还至您的账户`;
  }
  // 账户内新手计划列表收益tips
  if (isNewbie && model.financeplanEarnAmount) {
    model.newbieQuitEarningsTips = model.subsidyInterest
      ? `计划收益${model.financeplanEarnAmount}元, 加息收益${
          model.subsidyInterest
        }元`
      : `计划收益${model.financeplanEarnAmount}元`;
  }

  // 新手推荐位最高利率, 基准利率+贴息利率
  model.totalExpectedRate = totalExpectedRate;
  return model;
};
