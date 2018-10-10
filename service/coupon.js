'use strict';

/**
 * coupon
 */
const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';

module.exports = {
  update(values, action = 'def') {
    let map = {
      // 兑换
      'exchange': '/coupon/codeExchangeCoupon',
      // 兑换
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
      // 最优优惠券
      'plan/best': '/financeplan/getCouponByPlan',
      // 可用优惠券数量
      'count': '/coupon/availableCouponCount',
      // 可用优惠券数量
      'def': '/coupon/availableCoupon'
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
      // 计划购买列表
      'plan/buy': '/financeplan/getCouponByAmount',
      // 我的优惠券
      'account/list': '/coupon/couponByUser',
      // 我的优惠券
      'def': '/coupon/couponByUser',
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
  }
};