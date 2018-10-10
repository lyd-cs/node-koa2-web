'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');

const { _, BUY_TYPE, BUY_CONFIRM_ERROR, AJAX_ERROR, INCOME_TREATMENT } = util;

const plan = async(ctx, next) => {
  await next();
};

plan.list = async(ctx, next) => {
  const { platform, userId, pageNumber, ipAddress } = ctx.args;

  _.extend(ctx.state, {
    page: pageNumber,
    pageUrl: '?page='
  });

  const query = {
    version: '1.0',
    userId,
    pageSize: 10,
    pageNumber,
    ipAddress,
    platform
  };
  ctx.state.page_keywords = util.planKeyWords;
  ctx.state.page_description = util.planDesc;
  await Promise.all([
    ctx.proxy.planList(query),
    ctx.proxy.planListRecommend({
      ...query,
      cashType: INCOME_TREATMENT.INVEST
    }),
    ctx.proxy.planListRecommend({
      ...query,
      cashType: INCOME_TREATMENT.CASH
    })
  ]).then(
    function(values) {
      if (!values[0] || !values[1] || !values[2]) {
        return;
      }
      const listData = JSON.parse(values[0]);
      const recommendListData = JSON.parse(values[1]);
      if (listData.status != 0 || recommendListData.status != 0) {
        return;
      }
      const totalCount = _.get(listData, 'data.totalCount', 0);
      const pageSize = _.get(listData, 'data.pageSize', 0) || 0;
      const pageTotal = util.pageCount(totalCount, pageSize);
      _.extend(ctx.state, {
        recommendData: _.get(recommendListData, 'data', ''),
        monthlyPaymentsRecommend:
          (values[2] && _.get(JSON.parse(values[2]), 'data.dataList')) || [],
        dataList: _.get(listData, 'data.dataList', ''),
        pageTotal: pageTotal
      });
    },
    function() {}
  );
  await next();
};

plan.ajaxList = async(ctx, next) => {
  const data = util.getListPageData.call(ctx);
  const _userId = _.get(ctx.state, 'user.id', 0) - 0 || 0;
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page='
  });
  const _data = {
    version: '1.0',
    userId: _userId,
    pageSize: 10,
    pageNumber: data.pageNumber
  };

  await ctx.proxy.planList(_data).then(
    function(value) {
      if (!value) {
        ctx.addError('noResult', 'null');
        return;
      }
      const listData = JSON.parse(value);
      if (listData.status != 0) {
        ctx.addError('noResult', listData.message);
        return;
      }
      const total = _.get(listData, 'data.totalCount');
      const pageSize = _.get(listData, 'data.pageSize');
      const count = util.pageCount(total, pageSize);
      _.extend(ctx.state, {
        dataList: _.get(listData, 'data.dataList', []),
        totalCount: total,
        pageTotal: count
      });
    },
    function() {}
  );
  await next();
};

plan.detail = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;
  const planId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  const data = {
    userId,
    ipAddress,
    platform,
    version: '1.0',
    financePlanId: planId
  };
  _.extend(ctx.state, {
    planId: planId
  });
  ctx.state.page_description = util.planDesc;
  await Promise.all([
    ctx.proxy.planDetail(data),
    ctx.state.isLogin
      ? ctx.proxy.userAssets({
          userId,
          ipAddress,
          platform
        })
      : null
  ]).then(
    function(values) {
      if (values[0] == 0) {
        return;
      }
      const ret = JSON.parse(values[0]);
      const balanceRet = ctx.state.isLogin ? JSON.parse(values[1]) : 0;
      if (ret.status !== 0) {
        return;
      }
      const planDetail = _.get(ret, 'data', {});
      const bestCoupon = _.get(planDetail, 'bestCoupon') || '';
      const coupons = _.get(planDetail, 'coupons', []);
      const allowAccess = _.get(planDetail, 'allowAccess');
      if (!allowAccess) {
        ctx.status = 406;
        return;
      }
      _.extend(ctx.state, {
        planDetail: planDetail,
        bestCoupon: bestCoupon,
        couponUsedTotal: coupons.length - 0 || 0,
        userAvailableBalance:
          _.get(balanceRet, 'data.point.availablePoints', 0) - 0 || 0
      });
    },
    function() {}
  );
  await next();
};

plan.detailJoinRecord = async(ctx, next) => {
  var planId = ctx
    .checkBody('id')
    .isInt()
    .toInt().value;
  const { userId, ipAddress, platform } = ctx.args;
  const _data = {
    version: '1.0',
    financePlanId: planId,
    order: 'TIME',
    userId,
    ipAddress,
    platform
  };
  await ctx.proxy.getProductJoinRecord(_data).then(
    function(value) {
      if (!value) {
        ctx.addError('noResult', 'null');
        return;
      }
      const ret = JSON.parse(value);
      if (ret.status !== 0) {
        ctx.addError('noResult', ret.message);
        return;
      }
      ctx.state.userName = _.get(ctx.state, 'user.name') || '';
      ctx.state.dataList = _.get(ret, 'data.dataList', []);
    },
    function() {}
  );
  await next();
};

plan.buyConfirm = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;
  const planId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  const data = {
    userId,
    ipAddress,
    platform,
    financePlanId: planId,
    version: '1.0',
    cashTypeStr: 'INVEST',
    amountStr: ctx.checkBody('amount').trim().value,
    riskType: ctx.checkBody('risktype').value
  };
  ctx.state.planId = planId;
  await Promise.all([
    ctx.proxy.planConfirm(data),
    ctx.state.isLogin ? ctx.proxy.userAssets(data) : null,
    ctx.proxy.accountWithDrawUserCard(data)
  ]).then(
    function(value) {
      const buyconfirm = JSON.parse(value[0]);
      if (buyconfirm.status != 0) {
        _.extend(ctx.state, {
          errorMessage: _.get(buyconfirm, 'message') || ErrMsg.def,
          errorCode: _.get(buyconfirm, 'status') - 0
        });
        return;
      }
      _.extend(ctx.state, {
        buyConfirm: _.get(buyconfirm, 'data', {}),
        couponList: _.get(buyconfirm, 'data.coupons') || [],
        couponBest: _.get(buyconfirm, 'data.bestCoupon') || '',
        bestCouponId: _.get(buyconfirm, 'data.bestCoupon.id') || 0,
        userAssets:
          (value[1] && _.get(JSON.parse(value[1]), 'data.point')) || '',
        userCard:
          (value[2] && _.get(JSON.parse(value[2]), 'data.userBank')) || ''
      });
    },
    function() {}
  );
  await next();
};

plan.couponList = async(ctx, next) => {
  var msg = ErrMsg.def;
  const { userId, ipAddress, platform } = ctx.args;
  const data = {
    financePlanId: ctx.checkBody('productId').value,
    amountStr: ctx.checkBody('bidAmount').value,
    cashTypeStr: 'INVEST',
    userId,
    ipAddress,
    platform
  };
  var value = await ctx.proxy.planConfirm(data);
  if (!value) {
    ctx.dumpJSON(400, msg);
    return;
  }
  const ret = JSON.parse(value);
  if (!ret || ret.status !== 0) {
    ctx.dumpJSON(400, ret.message || msg);
    return;
  }
  ctx.state.couponList = _.get(ret, 'data.coupons');
  ctx.state.couponActive = ctx.checkBody('couponId').value;
  ctx.state.couponBest = _.get(ret, 'data.bestCoupon') || '';
  ctx.dumpJSON();
  await next();
};

plan.postResult = async(ctx, next) => {
  const _amount = ctx.checkBody('amount').trim().value;
  const _productId = ctx.checkBody('planid').trim().value;

  ctx.state.productId = _productId;
  ctx.state.amount = _amount;

  await next();
};

plan.buyResult = async(ctx, next) => {
  var err = _.clone(AJAX_ERROR);
  const { userId, platform, ipAddress } = ctx.args;
  const planId = ctx.checkBody('productId').trim().value;
  const buytype = ctx.checkBody('buyType').value || '';
  const data = {
    userId,
    ipAddress,
    platform,
    financePlanId: planId,
    amountStr: ctx.checkBody('amount').notEmpty(ErrMsg.isAmount).value,
    buyType: BUY_TYPE[buytype],
    password:
      buytype === 'BALANCE'
        ? ctx
            .checkBody('password')
            .notEmpty(ErrMsg.emptyPwd)
            .trim().value
        : '',
    balanceAmount:
      buytype === 'RECHARGE' ? ctx.checkBody('balanceAmount').value || '' : 0,
    smsCode:
      buytype === 'RECHARGE'
        ? ctx
            .checkBody('smsCode')
            .notEmpty(ErrMsg.isEmptySmsCode)
            .trim().value
        : '',
    couponId: ctx.checkBody('couponId').value.replace(/^0$/, '') || '',
    willingToBuy: ctx.checkBody('willingToBuy').value ? '1' : '0',
    cashTypeStr: 'INVEST',
    version: '1.0'
  };
  if (ctx.errors) {
    err.data = ctx.errors;
    ctx.body = err;
    return;
  }
  ctx.state.planId = planId;
  await ctx.proxy.planBuyResult(data).then(
    function(val) {
      if (!val) {
        ctx.state.isSuccess = 0;
        ctx.state.errorMessage = ErrMsg.def;
        return next();
      }
      var ret = JSON.parse(val);
      if (
        ret.status === BUY_CONFIRM_ERROR.ERRPASSWORD ||
        ret.status === BUY_CONFIRM_ERROR.ERRSMSCODE
      ) {
        err.message = ret.message;
        ctx.body = err;
        return;
      }
      if (ret.status != 0) {
        _.extend(ctx.state, {
          errorMessage: _.get(ret, 'message') || ErrMsg.def,
          errorCode: _.get(ret, 'status') - 0
        });
        return next();
      }
      ctx.state.isSuccess = 1;
      ctx.state.lockStart = _.get(ret, 'data.lockStart', '');
      return next();
    },
    function() {
      _.extend(ctx.state, {
        isSuccess: 0,
        errorCode: -999,
        isTransfer: 1
      });
      return next();
    }
  );
};

plan.couponChoose = async(ctx, next) => {
  // var err = _.clone(AJAX_ERROR);
  // var success = _.clone(AJAX_SUCCESS);
  var msg = ErrMsg.def;
  const { userId, ipAddress, platform } = ctx.args;
  const _couponId = ctx
    .checkBody('couponId')
    .isInt()
    .toInt().value;
  const _amountStr = ctx
    .checkBody('amountStr')
    .isInt()
    .toInt().value;
  var _data = {
    version: '1.0',
    couponId: _couponId,
    amountStr: _amountStr,
    userId,
    ipAddress,
    platform
  };
  var val = await ctx.proxy.productGetPayAmount(_data);
  if (!val) {
    ctx.dumpJSON(400, msg);
    return;
  }
  var ret = JSON.parse(val);
  if (ret.status !== 0) {
    ctx.dumpJSON(400, ret.message || msg);
    return;
  }
  ctx.dumpJSON(ret.data);
  await next();
};

plan.investList = async(ctx, next) => {
  const service = ctx.service.plan;

  const { userId, ipAddress, platform, pageSize, pageNumber } = ctx.args;

  _.extend(ctx.state, {
    page: pageNumber,
    pageUrl: '?page=',
    pageSize: pageSize
  });

  const data = {
    ipAddress,
    platform,
    userId,
    pageSize,
    pageNumber
  };
  let ret;

  try {
    ret = await service.query(data, 'plan/invest');
    const totalCount = _.get(ret, 'totalCount', 0);
    const pageSize = _.get(ret, 'pageSize', 0) || 0;
    const pageTotal = util.pageCount(totalCount, pageSize);
    _.extend(ctx.state, {
      dataList: _.get(ret, 'dataList') || [],
      pageTotal: pageTotal,
      totalCount: totalCount
    });
  } catch (error) {
    ctx.throw(error);
  }
  await next();
};

module.exports = plan;
