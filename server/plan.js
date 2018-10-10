'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const ErrorStatus = require('../lib/status');

const PlanModel = require('../model/plan');
const BuyResultModel = require('../model/buyResult');
const UserModel = require('../model/user');

const {
  _,
  API_SUCCESS,
  API_ERROR,
  parsePlanCashType,
  parseAccountPlanListCashDrawDay,
  parsePlanPayments,
  INCOME_TREATMENT,
  disabledDisplayInvite,
  quitWayDefault,
  quitWaysDesc
} = util;

const plan = async(ctx, next) => {
  await next();
};

// 计划列表
plan.list = async ctx => {
  const service = ctx.service.plan;

  const {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform,
    isNewbie,
    isLogin
  } = ctx.args;

  const query = {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  };

  // 对计划进行再排序
  function sortPlanList(planList = []) {
    //unifyStatus
    return _.sortBy(planList, [
      function(item) {
        return item.unifyStatus - 0;
      },
      function(item) {
        return item.expectedRate - 0;
      }
    ]);
  }

  const NEWBIE_PRODUCT_VERSION = 'newbie'; //2.5.0版本（计划列表的顶部新手产品）
  const MONTHLY_PRODUCT_VERSION = 'hxb'; //2.4.0版本（计划列表的顶部按月提取收益推荐）

  const actionMap = {
    [MONTHLY_PRODUCT_VERSION]: 'plan/recommend', //2.4.0版本计划列表的推荐
    [NEWBIE_PRODUCT_VERSION]: 'plan/newbieProduct' //2.5.0版本新手计划（包含之前2.4.0版本）
  };

  const cashType = (ctx.checkQuery('cashType').value || '').toLowerCase();

  let shouldRequestRecommend,
    shouldDisplayNewbieProduct,
    recommendAction,
    newbieAction,
    values,
    ret;
  // 根据cashType值区分不同版本list接口具有的功能
  const versionFunctionMap = {
    [NEWBIE_PRODUCT_VERSION](cashType) {
      shouldRequestRecommend = true;
      shouldDisplayNewbieProduct = isNewbie || !isLogin;
      recommendAction = actionMap[MONTHLY_PRODUCT_VERSION];
      newbieAction = actionMap[cashType];
    },
    [MONTHLY_PRODUCT_VERSION](cashType) {
      shouldRequestRecommend = true;
      recommendAction = actionMap[cashType];
    }
  };

  versionFunctionMap[cashType] && versionFunctionMap[cashType](cashType);

  const queryList = {
    ...query,
    cashType: INCOME_TREATMENT.INVEST
  };
  try {
    values = await Promise.all([
      service.query(queryList, 'list'),
      shouldRequestRecommend ? service.query(query, recommendAction) : null,
      shouldDisplayNewbieProduct ? service.query(query, newbieAction) : null
    ]);
    const { dataList = [] } = values[0];
    ret = {
      ...values[0],
      dataList: sortPlanList(dataList).map(PlanModel)
    };
    if (shouldRequestRecommend) {
      const recommendList = _.get(values[1], 'dataList', []).map(PlanModel);
      Object.assign(ret, { recommendList });
    }
    if (shouldDisplayNewbieProduct) {
      const newbieProductList = _.get(values[2], 'dataList', []).map(PlanModel);
      Object.assign(ret, { newbieProductList });
    }
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

plan.detail = async ctx => {
  const service = ctx.service.plan;
  const now = Date.now();
  const financePlanId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;

  const { userId, ipAddress, platform } = ctx.args;
  const query = {
    userId,
    ipAddress,
    platform,
    financePlanId
  };

  let values, ret;

  try {
    values = await service.query(query, 'detail');

    const {
      dataList: [detailData]
    } = values;

    const { beginSellingTime, cashType, cashDrawDay } = detailData;
    const timestamp = util.moment(beginSellingTime).format('x');
    const diffTime = timestamp - now;

    ret = {
      ...values,
      ...PlanModel(detailData),
      dataList: [],
      diffTime,
      incomeApproach: parsePlanCashType(cashType),
      quitWayDefault,
      quitWaysDesc
    };

    if (parsePlanPayments(cashType)) {
      const interestDate = parseAccountPlanListCashDrawDay(cashDrawDay);
      Object.assign(ret, { interestDate });
    }
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

plan.record = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;

  var success = _.cloneDeep(API_SUCCESS);
  var error = _.cloneDeep(API_ERROR);
  var _productId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;

  var _data = {
    financePlanId: _productId,
    order: 'TIME',
    userId,
    ipAddress,
    platform
  };
  var _value = await ctx.proxy.getProductJoinRecord(_data);

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
      dataList: util.encryptName(username, _.get(ret, 'data.dataList'))
    }) || {};
  ctx.body = success;
  await next();
};

plan.buyConfirm = async(ctx, next) => {
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
    financePlanId: _productId,
    amountStr: _amount,
    cashTypeStr: 'INVEST',
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }
  var _value = await ctx.proxy.planConfirm(_data);

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

plan.buyResult = async ctx => {
  const service = ctx.service.plan;

  const BUY_TYPE = {
    balance: 1,
    recharge: 2
  };
  const CASH_TYPE = {
    INVEST: 'INVEST',
    HXB: 'HXB'
  };
  const DEFAULT_BUY_TYPE = 'balance';
  const DEFAULT_CASH_TYPE = 'INVEST';

  const { userState } = ctx.state;
  const userInfo = {
    ...(userState && UserModel(userState))
  };
  const { userId, ipAddress, platform } = ctx.args;

  let tip;
  let values;
  let ret;
  let buyType = ctx.checkBody('buyType').value;
  let cashType = ctx.checkBody('cashType').value;
  const willingToBuy = ctx.checkBody('willingToBuy').optional().value;

  if (!buyType || !BUY_TYPE[buyType]) {
    buyType = DEFAULT_BUY_TYPE;
  }
  if (!cashType || !CASH_TYPE[cashType]) {
    cashType = DEFAULT_CASH_TYPE;
  }

  const query = {
    financePlanId: ctx
      .checkParams('id')
      .notEmpty((tip = ErrMsg.isProductEmptyId))
      .trim()
      .isInt(tip)
      .toInt(tip).value,
    buyType: BUY_TYPE[buyType],
    cashTypeStr: CASH_TYPE[cashType],
    amountStr: ctx
      .checkBody('amount')
      .notEmpty(ErrMsg.isAmount)
      .trim().value,
    couponId: ctx.checkBody('couponId').value || '',
    balanceAmount: '',
    password: '', // 余额购买 才需要，但是后端password是必填，先写空，后续他们会修改
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

plan.investList = async ctx => {
  const service = ctx.service.plan;

  const { userId, pageSize, pageNumber, ipAddress, platform } = ctx.args;

  const query = {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  };

  let values, ret;

  try {
    values = await service.query(query, 'investList');

    ret = { ...values };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = plan;
