'use strict';

/**
 * user
 */
const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';


module.exports = {
  update(values, action = 'def') {
    let map = {
      'recharge': '/escrow/recharge/enterprisepay',
      'recharge/result/baofu': '/escrow/recharge/rechargeRedirect'
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