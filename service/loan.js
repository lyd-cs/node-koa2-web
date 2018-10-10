'use strict';

/**
 * loan
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
      // 购买支付页
      'buy/confirm': '/lend/loanlenderconfirm',
      // 购买结果页
      'buy/pay': '/lend/loanlender',
      // 债转支付
      'transfer/pay': '/loantransfer/buyTransfer',
      'def': '',
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: HTTP_POST,
      form: values,
      baseUrl: API_BASE
    });
  },
  fetch(values, action = 'def') {
    let map = {
      'def': '',
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: HTTP_POST,
      form: values,
      baseUrl: API_BASE
    });
  },
  query(values, action = 'def') {
    let method = HTTP_GET;
    let map = {
      // transfer 列表页
      'transfer': '/loantransfer/loanTransferList',
      // 账户外详情页
      'detail': '/lend/loandetail',
      // 账户外transfer/detail
      'transfer/detail': '/loantransfer/getTransferDetail',
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