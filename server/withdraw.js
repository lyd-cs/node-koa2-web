'use strict';

/**
 * withdraw
 */

const ErrorStatus = require('../lib/status');
const BankCardModel = require('../model/bankCard');
const WithdrawRecordModel = require('../model/withdrawRecord');
const {
  _,
  MIN_USER_WITHDRAW_AMOUNT
} = require('../lib/util');

const withdraw = async(ctx) => {
  const id = ~~(Math.random() * 10);
  const url = `https://picsum.photos/720/1280/?image=${id}`;
  ctx.dumpJSON({
    url,
  });
};

// 提现页面
withdraw.home = async(ctx) => {
  const service = ctx.service;

  const { userState } = ctx.state;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;


  const query = {
    userId,
    ipAddress,
    platform
  };

  let values;
  let ret;

  try {
    values = await Promise.all([
      // 提现处理中个数
      service.withdraw.fetch(query, 'count'),
      // 用户余额
      service.account.fetch(query, 'blance'),
      // 用户提现绑卡
      service.account.fetch(query, 'withdraw/card'),
      // 到帐时间
      service.account.fetch(query, 'bank/arrivaltime')
    ]);
    const bankCard = _.get(values, '[2].userBank');
    const arrivalTime = _.get(values, '[3].arrivalTime');
    ret = {
      inprocessCount: _.get(values, '[0].inprocessCount', 0),
      balanceAmount: _.get(values, '[1].point.availablePoints', 0),
      bankCard: bankCard && BankCardModel(bankCard, { arrivalTime }),
      minWithdrawAmount: MIN_USER_WITHDRAW_AMOUNT,
      mobileNumber: _.get(userState, 'mobile')
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 提现记录列表
withdraw.query = async(ctx) => {
  const service = ctx.service.withdraw;

  const {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  } = ctx.args;

  const query = {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  };

  let values;
  let ret;

  try {
    // 提现记录
    // http://doc.hoomxb.com/index.php?s=/2&page_id=305
    values = await service.query(query, 'list');
    ret = {
      dataList: [],
      totalCount: 0,
      pageNumber: 1,
      ...values,
      ... {
        dataList: _.get(values, 'dataList', []).map(WithdrawRecordModel),
      }
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = withdraw;