'use strict';

/**
 * account
 * account & user 区别，从用户注册开始流程，如果该功能不在个人中心，那么就是user的
 * 如果，一个功能 user 和 account 都有，那么是user的(user 里面先出现，先出现的功能为准)
 * 比如 手机验证码: user 用户余额 account
 */
const request = require('../lib/request.js');
const {
  config
} = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';


module.exports = {
  update(values, action = 'def') {
    let map = {
      // 风险评测
      'risk': '/account/riskEvaluation',
      // 绑定银行卡
      'bankcard/bind': '/account/singleBindCard',
      // 解绑银行卡
      'bankcard/unbind': '/account/unbindCardOp',
      // 用户信息
      'def': '',
      //计划退出申请确认
      'quit/confirm': '/financeplan/toFinanceplanQuit',
      //计划退出
      'quit': '/financeplan/financeplanQuit',
      //撤销退出
      'quit/cancle': '/financeplan/financeplanQuitCancel',
      //取消加入确认
      'join/cancle/confirm': '/financeplan/toCancelFinancePlan',
      //取消加入
      'join/cancle': '/financeplan/cancelFinancePlan'
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });
  },
  fetch(values, action = 'def') {
    let map = {
      // 银行卡信息
      'bankcard': '/escrow/recharge/getUserBank',
      // 顾问
      'advisor': '/account/showInvestcodeInfo',
      // 用户余额
      'blance': '/account/userpoint',
      // 银行卡到帐时间
      'bank/arrivaltime': '/paycenter/getArrivalTime',
      // 资产
      'asset': '/account/asset',
      // 用户提现银行卡
      'withdraw/card': '/paycenter/getUserBank',
      // 账户内红利合同
      'accountPlanAgreement': '/financeplan/myPlanServiceAgreement',
      // 账户内散标合同
      'accountLoanAgreement': '/lend/loanAgreement',
      // 账户内债权转让合同
      'accountTransferAgreement': '/loantransfer/loanTransferAgreement',
      // 账户内邀请好友统计字段
      'inviteCount': '/account/getInviteStatist',
      //邀请码校验
      'vertifyInviteCode': '/account/verifyInvestCode',
      // 用户信息
      'def': '',
    };

    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });
  },
  query(values, action = 'def') {
    let map = {
      // 解绑银行卡
      'unbindBankCard': '/account/unbindCardOp',
      // 网关充值
      'accountRecharge': '/escrow/recharge/gatewayRechargeRequest',
      // 网关充值回调通知
      'accountRechargeResultDeal': '/escrow/recharge/rechargeSynback',
      // 账户内邀请好友列表
      'inviteList': '/account/getInviteInformation',
      // 账户内领取京东卡列表
      'account/jdCards': '/activity/getActivityCard',
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });
  },

};