'use strict';

const util = require('../lib/util');

const ErrorStatus = require('../lib/status');
const ErrMsg = require('../lib/errormsg');

const PlanModel = require('../model/plan');
const TransferModel = require('../model/transfer');
const BankCardModel = require('../model/bankCard');
const UserModel = require('../model/user');
const AssetsModel = require('../model/assets');

const {
  _,
  log4js,
  API_SUCCESS,
  API_ERROR,
  MIN_USER_CHARGE_AMOUNT,
  MIN_USER_WITHDRAW_AMOUNT,
  INCOME_TREATMENT,
  parseUserAgent,
  versionCompare,
  limitShow,
  planQuitResultDesc
} = util;
const logger = log4js.getLogger('API:account');

/**
 * get filter
 */
function getFilter() {
  var ctx = this;
  var filter = ctx.checkQuery('filter').default(1).value - 0 || 0;
  if (_.indexOf([1, 2, 3], filter) === -1) {
    filter = 1;
  }
  return { filter: filter };
}
/**
 * filter to data
 */
function filterToData(data) {
  var dict = {
    '1': { type: 'REPAYING_LOAN' }, //收益中
    '2': { type: 'BID_LOAN' }, //投标中
    '3': { type: 'FINISH_LOAN' } //已结清
  };
  var k = data.filter;
  if (!(k in dict)) {
    k = 1;
  }
  return dict[k];
}
/**
 * plan filter to data
 */
function planFilterToData(data) {
  var dict = {
    '1': { type: 'HOLD_PLAN' }, //收益中
    '2': { type: 'EXITING_PLAN' }, //投标中
    '3': { type: 'EXIT_PLAN' } //已结清
  };
  var k = data.filter;
  if (!(k in dict)) {
    k = 1;
  }
  return dict[k];
}
/*
 * return quota obj
 * */
function getQuota(obj) {
  return {
    quota: limitShow(obj, true)
  };
}

// 计划取消加入确认
function planCancelBuyConfirmModel(model = {}) {
  const cancelBuyDesc = model.coolingTime
    ? `加入红利智投后${
        model.coolingTime
      }分钟内可随时取消，取消后，您将无法再次加入本期红利智投，您加入本期红利智投的全部金额将会自动返还至账户余额（返还金额中不包括已使用的优惠券金额，同时已使用的优惠券将无法再次使用），如不撤销将进入锁定期继续享有收益。`
    : '';
  const couponUseDesc = model.couponAmount
    ? `您使用的优惠券金额${model.couponAmount}元已被扣除`
    : '';
  return {
    ...model,
    cancelBuyDesc,
    couponUseDesc
  };
}

// 计划取消加入结果
function planCancelBuyResultModel(model = {}) {
  const desc = model.financePlanName
    ? `您加入的${model.financePlanName}已退出`
    : '';
  return {
    ...model,
    desc
  };
}

const account = async(ctx, next) => {
  await next();
};

// 用户中心首页
account.home = async ctx => {
  const service = ctx.service;

  const { userId, pageSize, pageNumber, ipAddress, platform } = ctx.args;

  const query = {
    userId,
    ipAddress,
    platform
  };

  const { userState = {} } = ctx.state;
  const { isDisplayInvite } = {
    ...(userState && UserModel(userState))
  };

  let values;
  let ret;
  try {
    values = await Promise.all([
      // 用户资产
      service.account.fetch(query, 'asset'),
      // 优惠券数量
      service.coupon.fetch(
        {
          pageSize,
          pageNumber,
          ...query
        },
        'count'
      )
    ]);

    ret = {
      ...AssetsModel(_.get(values, '[0]', {})),
      availableCouponCount: ~~_.get(values, '[1].totalCount') || 0,
      isDisplayInvite
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }

  ctx.dumpJSON(ret);
};

// 账户资产和信息
account.detail = async ctx => {
  const service = ctx.service.account;

  const { userState } = ctx.state;
  const { userId, ipAddress, platform } = ctx.args;

  const query = {
    userId,
    ipAddress,
    platform
  };
  let values;
  let ret;

  try {
    values = await service.fetch(query, 'asset');
    ret = {
      userAssets: AssetsModel(values || {}),
      userInfo: {
        ...(userState && UserModel(userState))
      }
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 计划
account.plan = async ctx => {
  const service = ctx.service.plan;

  const {
    pageNumber,
    // pageSize,
    userId,
    platform,
    ipAddress,
    userAgent
  } = ctx.args;

  // ios2.3.1老版本分页有问题，暂时先指定40条/页，待以后整体强升后再改回默认
  const specialPageSize = 40;

  const { version } = parseUserAgent(userAgent);
  const monthlyPaymentsPlanMinVersion = '2.4.0';
  const newbieProductMinVersion = '2.8.0';
  // 注意filter，按照版本从小到大排列,不可乱序
  const filterMap = {
    [monthlyPaymentsPlanMinVersion](model = {}) {
      const planCashType = model.cashType;
      return planCashType !== INCOME_TREATMENT.CASH && !(model.novice - 0);
    },
    [newbieProductMinVersion](model = {}) {
      return !(model.novice - 0);
    }
  };
  const filterKey = Object.keys(filterMap).find(function(element) {
    return versionCompare(version, element) < 0;
  });
  const query = {
    userId,
    platform,
    ipAddress,
    pageNumber,
    pageSize: specialPageSize,
    ...planFilterToData(getFilter.call(ctx))
  };

  let values;
  let ret;

  try {
    values = await service.query(query, 'account/plan');
    let dataList = _.get(values, 'dataList', []).map(PlanModel);
    if (filterKey) {
      dataList = dataList.filter(filterMap[filterKey]);
    }
    ret = {
      ...values,
      dataList
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

account.planAssets = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _value = await ctx.proxy.accountPlanAsset({
    userId,
    ipAddress,
    platform
  });

  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status - 0 !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data.dataList') || {};
  ctx.body = success;
};

account.planDetail = async ctx => {
  const service = ctx.service.plan;

  const { userId, pageSize, pageNumber, ipAddress, platform } = ctx.args;

  let id = ~~ctx.checkParams('id').value || 0;
  const query = {
    financePlanId: id,
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  };
  let values;
  let ret;
  // id required
  if (!id) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }

  try {
    values = await service.fetch(query, 'account/detail');
    ret = PlanModel(_.get(values, 'dataList', {}));
  } catch (error) {
    logger.error('account.planToLoanRecord', error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

account.planToLoanRecord = async ctx => {
  const service = ctx.service.plan;

  const { userId, pageSize, pageNumber, ipAddress, platform } = ctx.args;

  let id = ~~ctx.checkParams('id').value || 0;
  const query = {
    id,
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  };
  let values;
  let ret;
  // id required
  if (!id) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }

  try {
    values = await service.query(query, 'account/transfer');
    ret = {
      totalCount: 0,
      pageSize,
      pageNumber,
      ...values,
      dataList: _.get(values, 'dataList', []).map(TransferModel)
    };
  } catch (error) {
    logger.error('account.planToLoanRecord', error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 计划退出
account.planQuit = async ctx => {
  const service = ctx.service.plan;

  const { userId, ipAddress, platform } = ctx.args;

  const DEFAULT_ACTION = 'result';
  const CONFIRM_ACTION = 'confirm';
  const CANCEL_ACTION = 'cancel';

  const action = ctx.checkBody('action').value || DEFAULT_ACTION;
  const financePlanId = ~~ctx.checkParams('id').value || 0;
  const smsCode = ctx.checkBody('smscode').value || '';

  const actionMap = {
    [CONFIRM_ACTION]: 'account/plan/quit/confirm',
    [CANCEL_ACTION]: 'account/plan/quit/cancel',
    [DEFAULT_ACTION]: 'account/plan/quit/result'
  };
  const actionModelMap = {
    [CONFIRM_ACTION]: '在退出时间之前均可撤销退出，期间收益会继续享有。',
    [DEFAULT_ACTION]: planQuitResultDesc
  };
  const query = {
    financePlanId,
    userId,
    ipAddress,
    platform
  };
  // 默认action
  if (!action || !(action in actionMap)) {
    action = DEFAULT_ACTION;
  }
  // 退出结果接口才需要smscode
  if (action === DEFAULT_ACTION) query.smsCode = smsCode;

  let values, ret;
  // id required
  if (!financePlanId) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }

  // smsCode
  if (action === DEFAULT_ACTION && !smsCode) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.isEmptySmsCode);
    return;
  }

  try {
    values = await service.update(query, actionMap[action]);
    ret = {
      ...values
    };
    if (action !== CANCEL_ACTION) {
      let quitDesc = actionModelMap[action];
      ret.quitDesc =
        typeof quitDesc === 'string'
          ? quitDesc
          : quitDesc(values.endLockingTime - 0);
    }
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 冷静期计划取消购买
account.planCancelBuy = async ctx => {
  const service = ctx.service.plan;

  const { userId, ipAddress, platform } = ctx.args;

  const DEFAULT_ACTION = 'result';
  const CONFIRM_ACTION = 'confirm';

  const action = ctx.checkBody('action').value || DEFAULT_ACTION;
  const smsCode = ctx.checkBody('smscode').value || '';
  const financePlanId = ~~ctx.checkParams('id').value || 0;
  const actionMap = {
    [CONFIRM_ACTION]: 'account/plan/cancelBuy/confirm',
    [DEFAULT_ACTION]: 'account/plan/cancelBuy/result'
  };
  const actionModelMap = {
    [CONFIRM_ACTION]: planCancelBuyConfirmModel,
    [DEFAULT_ACTION]: planCancelBuyResultModel
  };
  const query = {
    financePlanId,
    userId,
    ipAddress,
    platform
  };
  // 默认action
  if (!action || !(action in actionMap)) {
    action = DEFAULT_ACTION;
  }
  if (action === DEFAULT_ACTION) query.smsCode = smsCode;

  let values, ret;
  // id required
  if (!financePlanId) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }

  if (action === DEFAULT_ACTION && !smsCode) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.isEmptySmsCode);
    return;
  }

  try {
    values = await service.update(query, actionMap[action]);

    ret = actionModelMap[action](values);
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

account.loan = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var query;
  var data = util.getListPageData.call(ctx);
  var _pageSize = ctx.checkQuery('pageSize').value - 0 || data.pageSize;

  // query for page ui
  query = getFilter.call(ctx);

  var _data = _.extend(
    {
      userId,
      platform,
      ipAddress
    },
    filterToData(query),
    {
      pageNumber: data.pageNumber,
      pageSize: _pageSize
    }
  );

  var _value = await ctx.proxy.accountLoanList(_data);

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
  var _dataList = _.get(ret, 'data.loanList');
  if (!_dataList || _dataList.length == 0) {
    success.data = {};
  } else {
    success.data.dataList = _dataList;
    success.data.totalCount = _.get(ret, 'data.totalCount');
    success.data.pageSize = _.get(ret, 'data.pageSize');
    success.data.pageNumber = _.get(ret, 'data.pageNumber');
  }
  //success.data = _.get(ret, 'data.loanList') || {};
  ctx.body = success;
};

account.loanAssets = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);

  var _value = await ctx.proxy.accountLoanAsset({
    userId,
    platform,
    ipAddress
  });
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status - 0 !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data.loanStatis[0]') || [];
  ctx.body = success;
};

account.tradList = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _filter = ctx
    .checkQuery('filter')
    .optional()
    .empty().value;
  var _fundType = _.get(util.parseFundParentType(_filter), 'code') || '';
  var data = util.getListPageData.call(ctx);
  var _pageSize = ctx.checkQuery('pageSize').value - 0 || data.pageSize;

  var _data = _.extend(
    {
      userId,
      platform,
      ipAddress
    },
    {
      pointSearchType: _fundType,
      startDay: '',
      endDay: '',
      pageNumber: data.pageNumber,
      pageSize: _pageSize
    }
  );
  var _value = await ctx.proxy.getTradRecord(_data);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status - 0 !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  var _dataList = _.get(ret, 'data.pointLog_list');
  var newDataList = _.map(_dataList, util.chargeBanlanceAddTag);
  success.data.totalCount = _.get(ret, 'data.totalCount') || 0;
  success.data.dataList = newDataList;
  ctx.body = success;
};

account.withdraw = async ctx => {
  const { userId, platform, ipAddress } = ctx.args;
  var realname = _.get(ctx.state, 'userState.realName') || '';
  var amount = ctx.checkBody('amount').notEmpty(ErrMsg.isEmptyAmount).value;
  var query = _.assign(
    {
      userId,
      platform,
      ipAddress
    },
    {
      bankno:
        ctx.checkBody('bankno').notEmpty(ErrMsg.isEmpTyBankNo).value || '',
      cityno: ctx.checkBody('city').value || '1000',
      accntno: ctx.checkBody('bank').notEmpty(ErrMsg.isBankIdEmpty).value || '',
      mobileVerificationCode: ctx
        .checkBody('smscode')
        .notEmpty(ErrMsg.isEmptySmsCode)
        .len(6, 6, ErrMsg.lenSmsCode)
        .trim().value,
      amt: util.toFixed(amount, 2),
      accntnm: realname
    }
  );

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  if (query.amt < MIN_USER_WITHDRAW_AMOUNT) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.withdrawError);
    return;
  }

  var value = await ctx.proxy.accountWithDraw(query);

  if (!value) {
    ctx.dumpJSON(ErrorStatus.FAIL);
    return;
  }
  var ret = JSON.parse(value);
  if (!ret || ret.status - 0 !== 0) {
    ctx.dumpJSON(ErrorStatus.FAIL, ret.message);
    return;
  }
  _.extend(ret.data, {
    cardNo: query.accntno,
    amount: amount
  });
  ctx.dumpJSON(ret.data);
};

account.bankCard = async ctx => {
  const service = ctx.service.account;

  const { userId, ipAddress, platform } = ctx.args;

  const query = {
    userId,
    ipAddress,
    platform
  };

  let values;
  let ret;

  try {
    values = await service.fetch(query, 'bankcard');
    let { enableUnbind, enableUnbindReason, userBank } = values;
    ret = {
      enableUnbind,
      enableUnbindReason,
      ...BankCardModel(userBank)
    };
  } catch (error) {
    logger.error(error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

account.bankList = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _dataList = [];
  var _value = util.bankTips;
  var _bankList = util.bankCodeList;

  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  _.forEach(_bankList, function(v) {
    var bankItem = _value[v];
    if (!!bankItem) {
      var _item = _.assign(bankItem, { bankCode: v }, getQuota(bankItem));
      _dataList.push(_item);
    }
  });
  _.extend(success.data, {
    dataList: _dataList
  });
  ctx.body = success;
};

account.transferList = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var data = util.getListPageData.call(ctx);
  var _pageSize =
    ctx.checkQuery('pageSize').default(0).value - 0 || data.pageSize;
  var _type = ctx
    .checkQuery('type')
    .trim()
    .notEmpty(ErrMsg.isEmptyType).value;

  var _data = _.extend(
    {
      userId,
      ipAddress,
      platform
    },
    {
      pageNumber: data.pageNumber,
      pageSize: _pageSize,
      type: _type
    }
  );
  if (ctx.errors) {
    error.message = ErrMsg.isEmptyType;
    ctx.body = error;
    return await next();
  }

  try {
    var _value = await ctx.proxy.accountLoanList(_data);

    if (!_value) {
      ctx.throw(ErrMsg.def);
    }
    var ret = JSON.parse(_value);
    if (!ret || ret.status !== 0) {
      ctx.throw(ret.message);
    }
    success.data = _.get(ret, 'data') || {};
    var loanList = _.get(ret, 'data.loanList') || [];
    _.assign(success.data, { dataList: loanList });
    delete success.data.loanList;
    ctx.body = success;
    await next();
  } catch (err) {
    error.message = err.message;
    ctx.body = error;
    return await next();
  }
};

account.transferConfirm = async(ctx, next) => {
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

  var _data = _.extend({ userId, ipAddress, platform }, { loanId: _productId });
  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    var _value = await ctx.proxy.accountLoanTransfer(_data);

    if (!_value) {
      ctx.throw(ErrMsg.def);
    }
    var ret = JSON.parse(_value);
    if (!ret || ret.status !== 0) {
      ctx.throw(ret.message);
    }
    success.data = _.get(ret, 'data') || {};
    ctx.body = success;
    await next();
  } catch (err) {
    error.message = err.message;
    ctx.body = error;
    return await next();
  }
};

account.transferResult = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _data = _.extend(
    { userId, ipAddress, platform },
    {
      loanId:
        ctx
          .checkParams('id')
          .trim()
          .notEmpty(ErrMsg.isProductEmptyId)
          .isInt(ErrMsg.isProductIdInt)
          .toInt().value - 0,
      cashPassword: ctx
        .checkBody('tradPassword')
        .notEmpty(ErrMsg.isEmptyTradPwd)
        .trim().value,
      currentTransferValue: ctx
        .checkBody('currentTransferValue')
        .notEmpty(ErrMsg.isEmptyTransferValue)
        .trim().value
    }
  );

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    var _value = await ctx.proxy.accountTransferResult(_data);

    if (!_value) {
      ctx.throw(ErrMsg.def);
    }
    var ret = JSON.parse(_value);
    if (!ret || ret.status !== 0) {
      var _status = ret.status;
      error.message = ret.message;
      if (_status in util.TYPECODE.PRODUCT_BUY_ERROR_CODE) {
        error.status = _status;
      }
      ctx.body = error;
      return;
    }
    success.data = _.get(ret, 'data') || {};
    ctx.body = success;
    await next();
  } catch (err) {
    error.message = err.message;
    ctx.body = error;
  }
};

account.withdrawTime = async(ctx, next) => {
  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _value = await ctx.proxy.accountWithdrawTime();
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status - 0 !== 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  success.data = _.get(ret, 'data') || {};
  ctx.body = success;
};

account.escrowVerify = async(ctx, next) => {
  var error = _.cloneDeep(API_ERROR);
  var _userInfo = _.get(ctx.state, 'userState', '');

  var _path = ctx.path;
  var _verifyOriginPath = ['/plan', '/loan', '/transfer'].filter(function(
    item
  ) {
    return _path.indexOf(item) >= 0;
  });
  var _isCreateEscrowAcc = _userInfo.isCreateEscrowAcc - 0,
    _isCashPassword = _userInfo.isCashPasswordPassed - 0,
    _isBindCard = _userInfo.hasBindCard - 0,
    _isRealname = _userInfo.isIdPassed - 0;

  if (!_isCreateEscrowAcc) {
    error.message = ErrMsg.notOpenEscrowAcc;
    ctx.body = error;
    return;
  }
  if (!_isRealname) {
    error.message = ErrMsg.isTrusted;
    ctx.body = error;
    return;
  }
  if (!_isCashPassword || (!_verifyOriginPath.length && !_isBindCard)) {
    error.message = ErrMsg.escrowAccImperfectInfo;
    ctx.body = error;
    return;
  }
  await next();
};

account.riskVerify = async(ctx, next) => {
  var error = _.cloneDeep(API_ERROR);
  var _userInfo = _.get(ctx.state, 'userState', '');
  var _isRiskEvaluation = _.get(_userInfo, 'riskEvaluationScore') || '';

  if (!_isRiskEvaluation) {
    error.message = ErrMsg.noRiskEvaluation;
    ctx.body = error;
    return;
  }
  await next();
};

// 绑定银行卡
account.bankCardBind = async ctx => {
  const service = ctx.service.account;

  const { userId, ipAddress, platform } = ctx.args;

  const userInfo = _.get(ctx.state, 'userState') || {};
  const isCreateEscrowAcc = userInfo.isCreateEscrowAcc - 0;
  const isCashPassword = userInfo.isCashPasswordPassed - 0;
  const isBindCard = userInfo.hasBindCard - 0;
  const isRealname = userInfo.isIdPassed - 0;

  if (!isCreateEscrowAcc) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.notOpenEscrowAcc);
    return;
  }

  if (!isRealname || !isCashPassword) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.escrowAccImperfectInfo);
    return;
  }

  if (isBindCard) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.isBindBankCard);
    return;
  }

  const query = {
    userId,
    ipAddress,
    platform,
    bankNum: ctx
      .checkBody('bankCard')
      .notEmpty(ErrMsg.isBankIdEmpty)
      .trim().value,
    preMobile: ctx
      .checkBody('bankReservedMobile')
      .notEmpty(ErrMsg.emptyMobile)
      .match(util.reMobile, ErrMsg.isMobile)
      .trim().value,
    bankCode: ctx
      .checkBody('bankCode')
      .notEmpty(ErrMsg.isEmpTyBankNo)
      .trim().value
  };

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }

  try {
    await service.update(query, 'bankcard/bind');
  } catch (error) {
    logger.error('bankcard.bind', error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON();
};

// 解绑银行卡
account.bankCardUnbind = async ctx => {
  const service = ctx.service.account;

  const { userId, ipAddress, platform } = ctx.args;
  const idNo = ctx.checkBody('idCardNo').notEmpty(ErrMsg.emptyIdentity).value;
  const cashPassword = ctx
    .checkBody('cashPassword')
    .notEmpty(ErrMsg.isEmptyTradPwd).value;

  const query = {
    idNo,
    cashPassword,
    userId,
    ipAddress,
    platform
  };

  if (!util.isIdentityCode(query.idNo)) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.isIdentity);
    return;
  }

  if (ctx.errors) {
    let error = ctx.getError();
    ctx.dumpJSON(ErrorStatus.FAIL, error.message);
    return;
  }

  try {
    await service.update(query, 'bankcard/unbind');
  } catch (error) {
    logger.error('bankcard.unbind', error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON();
};

account.quickPay = async ctx => {
  const { userId, ipAddress, platform } = ctx.args;

  var smscode = ctx
    .checkBody('smscode')
    .notEmpty(ErrMsg.isEmptySmsCode)
    .len(6, 6, ErrMsg.lenSmsCode)
    .trim().value;
  var amount = ctx
    .checkBody('amount')
    .notEmpty(ErrMsg.isEmptyCharge)
    .match(util.reCash, ErrMsg.isCash).value;

  if (ctx.errors) {
    ctx.dumpJSON(
      ErrorStatus.PARAMS_FAIL,
      ctx.getError().message || ErrMsg.def,
      ctx.getErrors()
    );
    return;
  }
  if (amount < MIN_USER_CHARGE_AMOUNT) {
    ctx.dumpJSON(ErrorStatus.FAIL, ErrMsg.rechargeError);
    return;
  }
  var _data = _.assign(
    { userId, ipAddress, platform },
    {
      mobileVerificationCode: smscode,
      amt: util.toFixed(amount, 2)
    }
  );

  await ctx.proxy.quickPay(_data).then(
    function(value) {
      if (!value) {
        ctx.dumpJSON(ErrorStatus.FAIL);
        return;
      }
      var ret = JSON.parse(value);
      if (!ret || ret.status !== 0) {
        ctx.dumpJSON(ErrorStatus.FAIL, ret.message);
        return;
      }
      // 快捷充值 成功清零上次发送短信验证码时间 不限制次数，可以再次发送验证码
      ctx.session.lastsms = 0;
      ctx.dumpJSON(ret.data);
    },
    function(error) {
      logger.error('quickPay', error);
      ctx.dumpJSON(ErrorStatus.SERVER_FAIL, ErrMsg.def);
    }
  );
};

// 理财顾问
account.advisor = async ctx => {
  const service = ctx.service.account;

  const { userId, ipAddress, platform } = ctx.args;

  const query = {
    userId,
    ipAddress,
    platform
  };

  let ret;

  try {
    ret = await service.fetch(query, 'advisor');
  } catch (error) {
    logger.error(error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = account;
