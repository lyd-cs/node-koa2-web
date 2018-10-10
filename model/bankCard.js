'use strict';

/**
 * bankCard model
 */
const utils = require('../lib/util');
const { moment, limitShow } = utils;

const WITHDRAW_ARRIVE_OFFSET = 2;
const DATE_FORMAT = 'YYYY-MM-DD';
const DEFAULT_EMPTY_TEXT = '';
// const DEFAULT_LIMIT_TEXT = '--';

// exports
module.exports = (model = {}, extra = {}) => {
  const bankCode = model.bankCode;
  const bank = bankCode && utils.bankTips[bankCode];
  const single = (bank && bank.single) || DEFAULT_EMPTY_TEXT;
  const day = (bank && bank.day) || DEFAULT_EMPTY_TEXT;

  let withdrawArriveDate = moment()
    .add(WITHDRAW_ARRIVE_OFFSET, 'd')
    .format(DATE_FORMAT);

  if (extra && extra.arrivalTime) {
    withdrawArriveDate = moment(extra.arrivalTime).format(DATE_FORMAT);
  }

  model.bankArriveTimeText = `预计${withdrawArriveDate}(T+${WITHDRAW_ARRIVE_OFFSET}工作日)到帐`;
  // 限额
  model.single = single;
  model.day = day;
  model.quota = limitShow(bank, true);
  return model;
};
