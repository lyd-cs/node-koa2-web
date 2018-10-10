'use strict';

/**
 * plan
 */
const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';

const HTTP_GET = 'GET';
const HTTP_POST = 'POST';

module.exports = {
  update(values, action = 'def') {
    let map = {
      // 购买结果页
      'buy/confirm': '/financeplan/toRegisterfinanceplan',
      // 购买支付页
      'buy/pay': '/financeplan/registerfinanceplan',
      // 账户内计划退出前确认
      'account/plan/quit/confirm': '/financeplan/toFinanceplanQuit',
      // 账户内计划退出
      'account/plan/quit/result': '/financeplan/financeplanQuit',
      // 账户内计划退出撤销
      'account/plan/quit/cancel': '/financeplan/financeplanQuitCancel',
      // 账户内冷静期计划取消加入前确认
      'account/plan/cancelBuy/confirm': '/financeplan/toCancelFinancePlan',
      // 账户内冷静期计划取消加入
      'account/plan/cancelBuy/result': '/financeplan/cancelFinancePlan',
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
  fetch(values, action = 'def') {
    let map = {
      // 我的计划 单个计划详情
      'account/detail': '/financeplan/my_plan_detail',
      'def': '/financeplan/my_plan_detail',
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
    let method = HTTP_GET;
    let map = {
      // pc首页推荐
      'home/recommend': '/financeplan/queryForIndexUplanListNew',
      // 首页推荐
      'home/featured': '/financeplan/queryForIndexUplanListNewApp',
      // app 首页推荐位（2.4.0包括按月提取收益产品）
      'home/all': '/financeplan/planRecommendAppNew',
      // app 首页推荐位（2.5.0包括按月提取收益产品）
      'home/newbieVersionRecommend': '/financeplanapp/planRecommend',
      // app 首页&计划列表头部等的新手产品
      'plan/newbieProduct': '/financeplanapp/newBiePlanRecommend',
      // app 计划列表头部的推荐位（只有按月提取收益产品）
      'plan/recommend': '/financeplan/planListRecommendAppNew',
      'planlist/recommend': '/financeplan/queryForIndexUplanListNew',
      //新手专享产品推荐
      'novice': '/financeplanapp/newBiePlanRecommend',
      // 个人中心，我的计划的债转记录
      'account/transfer': '/financeplan/userfinanceplanLoanlist',
      // 个人中心，我的计划的列表
      'account/plan': '/account/userfinanceplanlist',
      // 列表页
      'list': '/financeplan/financeplanlist',
      // 详情页
      'detail': '/financeplan/financeplandetail',
      // 计划可投的新申请标的列表
      'investList': '/lend/loanList',
      'def': '/financeplan/financeplanlist',
      // 计划投标明细列表
      'plan/invest': '/lend/loanList',
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    // post 方法
    if (action == 'account/transfer') {
      method = HTTP_POST;
    }
    return request(url, {
      method,
      form: values,
      baseUrl: API_BASE
    });
  },
};