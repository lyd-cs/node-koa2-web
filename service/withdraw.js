'use strict';

/**
 * withdraw
 */
const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';


module.exports = {
  fetch(values, action = 'def') {
    let map = {
      // 提现处理中个数
      'count': 'paycenter/getCashDrawInprocessCount',
      // 提现页面统计信息
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
      // 提现记录
      'list': '/paycenter/getCashDrawLogs',
      'def': '/paycenter/getCashDrawLogs',
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
