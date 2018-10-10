'use strict';

/**
 * bankCard model
 */
const util = require('../lib/util');

const { _, moment } = util;

const STATUS = {
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL',
  UNKNOW: 'UNKNOW',
  CASHDRAW_SUCCESS: 'SUCCESS',
  CASHDRAW_FAILED: 'FAIL',
  REJECTED: 'FAIL',
  REFUND_RECHARGED: 'FAIL',
  REFUND: 'INPROCESS',
  CHECK_ERROR: 'FAIL',
  REVOKED: 'FAIL',
  INPROCESS_HAND: 'INPROCESS',
  PLATFORM_APPLY: 'INPROCESS',
  REJECTED_PROCESS: 'FAIL',
  REFUND_REC_PROCESS: 'FAIL',
  CASHDRAW_FA_PROCESS: 'FAIL',
  CHANNEL_REJECTED: 'FAIL',
  INPROCESS: 'INPROCESS',
  WAIT_CASHDRAW: 'INPROCESS',
  NEW_APPLY: 'INPROCESS'
};

const STATUS_TEXT = {
  SUCCESS: '成功',
  FAIL: '失败',
  INPROCESS: '处理中',
  UNKNOW: '未知状态'
};
const UNMATCH_TEXT = '';
const UNMATCH_KEY = 'UNKNOW';
const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm';

// find key from obj
function find(obj, key) {
  return (key && obj[key]) || UNMATCH_TEXT;
}

// format Date
function formatDateTime(time, fmt = DATE_TIME_FORMAT) {
  return (time && moment(time).format(fmt)) || UNMATCH_TEXT;
}

// exports
module.exports = (model = {}) => {
  const status = (model.status =
    find(STATUS, model.cashDrawStatus) || UNMATCH_KEY);
  const bankNum = model.bankNum || '';
  model.statusText = find(STATUS_TEXT, model.status);
  model.applyTimeText = formatDateTime(model.applyTime);
  model.arrivalTimeText = formatDateTime(model.arrivalTime, DATE_FORMAT);
  if (status === STATUS.SUCCESS) {
    model.logText = `提现成功： ${model.arrivalTimeText} 已到账`;
  } else if (status === STATUS.INPROCESS) {
    model.logText = '提现状态： 申请成功，等待银行处理中…';
  } else if (status === STATUS.FAIL) {
    model.logText = model.logDesc || '失败原因： 银行账户信息有误';
  } else {
    model.logText = UNMATCH_TEXT;
  }
  model.bankName = _.get(find(util.bankTips, model.bankCode), 'name', '');
  model.bankNumText = `(尾号${bankNum.slice(-4)})`;
  return model;
};
