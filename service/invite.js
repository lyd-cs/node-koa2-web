'use strict';

/**
 * invite 邀请好友
 **/

const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';

module.exports = {
  fetch(values, action = 'def') {
    let map = {
      // 统计信息
      'overview': '/account/getInviteStatist',
      // 统计信息
      'def': '/account/getInviteStatist'
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
      // 我的邀请列表
      'account/list': '/account/getInviteInformation',
      // 我的邀请列表
      'def': '/account/getInviteInformation',
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