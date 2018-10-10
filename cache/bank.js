'use strict';

const cache = require('memory-cache');

const util = require('../lib/util');
const service = require('../service/bank');

const conf = require('./conf');

exports.get_bank_list = async() => {
  var key = 'bankList';
  var value;
  var data = cache.get(key);
  if (data) {
    util.bankTips = data;
    return data;
  }
  try {
    value = await service.query({
      userId: 0,
      ipAddress: '127.0.0.1',
      platform: 'PC'
    }, 'bankList');
    data = value.bankList;
    util.bankTips = data;
  } catch (error) {
    return;
  }
  return cache.put(key, data, conf.LONG);
};

