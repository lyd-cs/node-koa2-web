'use strict';

const util = require('../lib/util');

const ErrorStatus = require('../lib/status');
const ErrMsg = require('../lib/errormsg');

const BuyResultModel = require('../model/buyResult');
const TransferModel = require('../model/transfer');
const UserModel = require('../model/user');
const LoanDetailModel = require('../model/loanDetail');

const { _, API_SUCCESS, API_ERROR, disabledDisplayInvite } = util;

//dataList add flashback index 、 encrypt name and return new list
function addFlashbackIndexAndEncryptName(username, dataList = []) {
  const dataListLen = dataList.length;
  var newDataList = dataList.map((currentValue, index) => {
    return _.assign(currentValue, { index: dataListLen - index });
  });

  return util.encryptName(username, newDataList);
}

const loan = async(ctx, next) => {
  await next();
};

loan.list = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var data = util.getListPageData.call(ctx);
  var _pageSize = ctx.checkQuery('pageSize').value - 0 || data.pageSize;

  var _data = {
    pageNumber: data.pageNumber,
    pageSize: _pageSize,
    userId,
    ipAddress,
    platform
  };
  var _value = await ctx.proxy.loanList(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || [];
  ctx.body = success;
};

loan.detail = async ctx => {
  const service = ctx.service.loan;
  const loanId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;

  const { userId, ipAddress, platform } = ctx.args;
  const query = {
    userId,
    ipAddress,
    platform,
    loanId
  };

  let values, ret;

  try {
    values = await service.query(query, 'detail');
    ret = LoanDetailModel(values);
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

loan.record = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _productId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  var _data = { loanId: _productId, userId, ipAddress, platform };
  var _value = await ctx.proxy.loanInvestRecord(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  var username = ctx.state.isLogin ? ctx.state.userState.username : '';
  success.data =
    _.assign(_.get(ret, 'data'), {
      loanLenderRecord_list: util.encryptName(
        username,
        _.get(ret, 'data.loanLenderRecord_list')
      )
    }) || {};
  ctx.body = success;
};

loan.buyConfirm = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _productId = ctx
    .checkParams('id')
    .notEmpty(ErrMsg.isProductEmptyId)
    .trim().value;
  var _amount = ctx
    .checkBody('amount')
    .notEmpty(ErrMsg.isAmount)
    .trim().value;
  var _data = {
    loanId: _productId,
    bidAmount: _amount,
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  var _value = await ctx.proxy.loanConfirm(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  var _status = ret.status;
  if (!ret || _status !== 0) {
    if (_status in util.TYPECODE.PRODUCT_BUY_ERROR_CODE) {
      error.status = _status;
    }
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || [];
  ctx.body = success;
  await next();
};

loan.buyResult = async ctx => {
  const service = ctx.service.loan;

  const BUY_TYPE = {
    balance: 1,
    recharge: 2
  };
  const DEFAULT_BUY_TYPE = 'balance';

  const { userState } = ctx.state;
  const userInfo = {
    ...(userState && UserModel(userState))
  };
  const { userId, ipAddress, platform } = ctx.args;

  let tip;
  let values;
  let ret;
  let buyType = ctx.checkBody('buyType').value;
  const willingToBuy = ctx.checkBody('willingToBuy').optional().value;

  if (!buyType || !BUY_TYPE[buyType]) {
    buyType = DEFAULT_BUY_TYPE;
  }

  const query = {
    loanId: ctx
      .checkParams('id')
      .notEmpty((tip = ErrMsg.isProductEmptyId))
      .trim()
      .isInt(tip)
      .toInt(tip).value,
    bidAmount: ctx
      .checkBody('amount')
      .notEmpty(ErrMsg.isAmount)
      .trim().value,
    buyType: BUY_TYPE[buyType],
    password: '',
    balanceAmount: '',
    smsCode: '',
    userId,
    ipAddress,
    platform
  };
  if (willingToBuy) {
    query.willingToBuy = willingToBuy;
  }
  // 余额购买
  if (buyType === 'balance') {
    query.password = ctx
      .checkBody('tradPassword')
      .notEmpty(ErrMsg.isEmptyTradPwd)
      .trim().value;
  } else if (buyType === 'recharge') {
    query.balanceAmount = ctx
      .checkBody('balanceAmount')
      .notEmpty(ErrMsg.isEmptyBalance)
      .trim().value;
    query.smsCode = ctx
      .checkBody('smsCode')
      .notEmpty(ErrMsg.isEmptySmsCode)
      .trim().value;
  }

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    values = await service.update(query, 'buy/pay');
    ret = BuyResultModel(values, {
      // 销售禁用活动提示
      disableActivity: disabledDisplayInvite(userInfo)
    });
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

loan.transfer = async ctx => {
  const service = ctx.service.loan;

  const { userId, pageSize, pageNumber, ipAddress, platform } = ctx.args;
  const FILTER_TO_STATUS = {
    def: 'TRANSFERING'
  };
  const DEFAULT_FILTER = 'def';

  let filter = ctx.checkBody('filter').value;

  // 筛选条件
  if (!filter || !FILTER_TO_STATUS[filter]) {
    filter = DEFAULT_FILTER;
  }
  let status = FILTER_TO_STATUS[filter];

  const query = {
    userId,
    pageSize,
    pageNumber,
    status,
    ipAddress,
    platform
  };

  let values;
  let ret;

  try {
    values = await service.query(query, 'transfer');
    ret = {
      ...values,
      dataList: _.get(values, 'dataList', []).map(TransferModel)
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

loan.transferDetail = async ctx => {
  const service = ctx.service.loan;
  const loanTransferId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  const { userId, ipAddress, platform } = ctx.args;
  const query = {
    userId,
    ipAddress,
    platform,
    loanTransferId
  };

  let values, ret;

  try {
    values = await service.query(query, 'transfer/detail');
    ret = LoanDetailModel(values);
    const { transferDetail: { userId: creditorId = 0 } = {} } = ret;
    ret = {
      ...ret,
      enabledBuy: creditorId !== userId
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

loan.debtRecord = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _productId =
    ctx
      .checkParams('id')
      .trim()
      .notEmpty(ErrMsg.isProductEmptyId)
      .isInt(ErrMsg.isProductIdInt)
      .toInt().value - 0;

  var _data = { loanTransferId: _productId, userId, ipAddress, platform };

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    var _value = await ctx.proxy.transferDebtList(_data);
    if (!_value) {
      ctx.throw(ErrMsg.def);
    }
    var ret = JSON.parse(_value);
    if (ret.status !== 0) {
      ctx.throw(ret.message);
    }
    var username = ctx.state.isLogin ? ctx.state.userState.username : '';
    success.data =
      _.assign(_.get(ret, 'data'), {
        dataList: util.encryptName(username, _.get(ret, 'data.dataList'))
      }) || {};
    ctx.body = success;
    await next();
  } catch (err) {
    error.message = err.message;
    ctx.body = error;
    return await next();
  }
};

loan.transferRecord = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _productId =
    ctx
      .checkParams('id')
      .trim()
      .notEmpty(ErrMsg.isProductEmptyId)
      .isInt(ErrMsg.isProductIdInt)
      .toInt().value - 0;

  var _data = { loanTransferId: _productId, userId, ipAddress, platform };

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    var _value = await ctx.proxy.transferOrderList(_data);
    if (!_value) {
      ctx.throw(ErrMsg.def);
    }
    var ret = JSON.parse(_value);
    if (!ret || ret.status !== 0) {
      ctx.throw(ret.message);
    }

    var _dataList = _.get(ret.data, 'dataList') || [];
    var username = ctx.state.isLogin ? ctx.state.userState.username : '';

    success.data =
      _.assign(_.get(ret, 'data'), {
        dataList: addFlashbackIndexAndEncryptName(username, _dataList)
      }) || {};

    ctx.body = success;
    await next();
  } catch (err) {
    error.message = err.message;
    ctx.body = error;
    return await next();
  }
};

loan.transferBuy = async ctx => {
  const service = ctx.service.loan;

  const BUY_TYPE = {
    balance: 1,
    recharge: 2
  };
  const DEFAULT_BUY_TYPE = 'balance';

  const { userState } = ctx.state;
  const userInfo = {
    ...(userState && UserModel(userState))
  };
  const { userId, ipAddress, platform } = ctx.args;

  let tip;
  let values;
  let ret;
  let buyType = ctx.checkBody('buyType').value;
  const willingToBuy = ctx.checkBody('willingToBuy').optional().value;

  if (!buyType || !BUY_TYPE[buyType]) {
    buyType = DEFAULT_BUY_TYPE;
  }

  const query = {
    transferId: ctx
      .checkParams('id')
      .notEmpty((tip = ErrMsg.isProductEmptyId))
      .trim()
      .isInt(tip)
      .toInt(tip).value,
    buyAmount:
      ctx
        .checkBody('amount')
        .notEmpty(ErrMsg.isAmount)
        .trim().value - 0,
    buyType: BUY_TYPE[buyType],
    password: '',
    balanceAmount: '',
    smsCode: '',
    userId,
    ipAddress,
    platform
  };
  if (willingToBuy) {
    query.willingToBuy = willingToBuy;
  }
  // 余额购买
  if (buyType === 'balance') {
    query.password = ctx
      .checkBody('tradPassword')
      .notEmpty(ErrMsg.isEmptyTradPwd)
      .trim().value;
  } else if (buyType === 'recharge') {
    query.balanceAmount = ctx
      .checkBody('balanceAmount')
      .notEmpty(ErrMsg.isEmptyBalance)
      .trim().value;
    query.smsCode = ctx
      .checkBody('smsCode')
      .notEmpty(ErrMsg.isEmptySmsCode)
      .trim().value;
  }

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    values = await service.update(query, 'transfer/pay');
    ret = BuyResultModel(values, {
      // 销售禁用活动提示
      disableActivity: disabledDisplayInvite(userInfo)
    });
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = loan;
