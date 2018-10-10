/* eslint-disable no-unused-vars */
'use strict';
var url = require('url');

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const transferModel = require('../model/transfer');

const {
  _,
  log4js,
  AJAX_ERROR,
  AJAX_SUCCESS
} = util;
const logger = log4js.getLogger('account');

const HTTP_POST = 'POST';

function getFilter() {
  var ctx = this;
  var filter = ctx.checkBody('filter').default(1).value - 0 || 0;
  if (_.indexOf([1, 2, 3, 4], filter) === -1) {
    filter = 1;
  }
  return {
    filter: filter
  };
}

function filterToData(data) {
  var dict = {
    '1': {
      type: 'REPAYING_LOAN'
    }, //收益中
    '2': {
      type: 'BID_LOAN'
    }, //投标中
    '3': {
      type: 'TRANSFERING_LOAN'
    }, //转让中
    '4': {
      type: 'FINISH_LOAN'
    } //已结清
  };
  var k = data.filter;
  if (!(k in dict)) {
    k = 1;
  }
  return dict[k];
}
const account = async(ctx, next) => {
  await next();
};
// heartbeat
account.heartBeat = async ctx => {
  var now = Date.now();
  ctx.body = {
    status: 0,
    message: 'success',
    data: {
      time: now
    }
  };
};
account.home = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const threeDayTimes = 3 * 24 * 3600 * 1000;
  const query = {
    pageNumber: 1,
    pageSize: 10,
    userId,
    ipAddress,
    platform
  };
  try {
    await Promise.all([
      ctx.proxy.getAccountAssest({
        userId,
        ipAddress,
        platform
      }),
      ctx.proxy.getTradRecord(query),
      ctx.proxy.accountCouponUnused({
        userId,
        ipAddress,
        platform
      })
    ]).then(
      function(values) {
        logger.info('account.home.values', values[0]);
        var ret = JSON.parse(values[2]);
        _.extend(ctx.state, {
          accountAssets:
            (values[0] && _.get(JSON.parse(values[0]), 'data')) || '',
          accountTradList:
            (values[1] && _.get(JSON.parse(values[1]), 'data.pointLog_list')) || [],
          accountAvailableCouponTotal: _.get(ret, 'data.totalCount') - 0 || 0,
          accountCouponData: _.get(ret, 'data.dataList') || []
        });
        ctx.state.passed = ctx.state.accountCouponData.some(function(element) {
          var currentTime = new Date().getTime();
          var cutTime = element.expireTime - currentTime;
          return cutTime < threeDayTimes;
        }, this);
      },
      function(error) {
        ctx.throw(error);
      }
    );
  } catch (e) {
    ctx.addError('page', e);
    return await next();
  }
  await next();
};
//coupon
account.couponExchange = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var msg = ErrMsg.def;
  var data = {
    code: ctx.checkBody('code').notEmpty(ErrMsg.isEmptyCouponCode).value,
    userId,
    ipAddress,
    platform
  };
  var value = await ctx.proxy.accountExchangeCoupon(data);
  if (ctx.errors) {
    ctx.state.errors = errors;
    return await next();
  }
  if (!value) {
    ctx.dumpJSON(400, msg);
    return;
  }
  var ret = JSON.parse(value);
  if (!ret || ret.status !== 0) {
    ctx.dumpJSON(400, ret.message || msg);
    return;
  }
  ctx.dumpJSON(ret.data);
  await next();
};
account.planDetail = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var _productId = ctx
    .checkParams('id')
    .trim()
    .notEmpty()
    .isInt()
    .toInt().value;

  var data = util.getListPageData.call(ctx, {
    id: _productId,
    userId,
    ipAddress,
    platform
  });
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page=',
    pageTotal: 0,
    pageSize: data.pageSize
  });
  var _productDetailData = {
    financePlanId: _productId,
    userId,
    ipAddress,
    platform
  };

  try {
    await Promise.all([
      ctx.proxy.accountPlanDetail(_productDetailData),
      ctx.proxy.accountPlanInvestLoan(data),
      ctx.proxy.accountPlanAgreement(_productDetailData)
    ]).then(
      function(values) {
        var _loanInvestList = util.toJSON(values[1]);
        var total = _.get(_loanInvestList, 'data.totalCount', 0) - 0 || 0;
        var size = _.get(_loanInvestList, 'data.pageSize', 0) - 0 || 0;
        var count = util.pageCount(total, size);
        var agreementDesc = util.toJSON(values[2]);
        var hasFile = _.get(agreementDesc, 'data.hasFile') || false;
        var filePath = _.get(agreementDesc, 'data.filePath') || '';
        var contractId = _.get(agreementDesc, 'data.contractId') - 0;
        _.extend(ctx.state, {
          planDetail:
            (values[0] && _.get(util.toJSON(values[0]), 'data.dataList')) || [],
          loanInvestList: _
            .get(_loanInvestList, 'data.dataList', [])
            .map(transferModel),
          totalCount: total,
          pageTotal: count,
          planId: _productId,
          hasAgreementFile: hasFile,
          agreementFilePath: filePath,
          _contractId: contractId
        });
      },
      function(error) {
        ctx.throw(error);
      }
    );
  } catch (e) {}
  await next();
};
account.planAgreement = async(ctx, next) => {
  const service = ctx.service;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const planId = ctx
    .checkParams('id')
    .trim()
    .notEmpty(ErrMsg.isProductEmptyId)
    .isInt()
    .toInt().value;
  const query = {
    financePlanId: planId,
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }
  let planAgreementVal;
  try {
    planAgreementVal = await service.account.fetch(
      query,
      'accountPlanAgreement'
    );
    var hasFile = _.get(planAgreementVal, 'hasFile') || false;
    if (!hasFile) {
      throw 500;
    }
    var filePath = _.get(planAgreementVal, 'filePath') || '';
    if (filePath && filePath.length) {
      ctx.redirect(filePath);
      return;
    } else {
      throw 404;
    }
  } catch (error) {
    ctx.throw(error);
  }
  await next();
};
account.loanAgreement = async(ctx, next) => {
  const service = ctx.service;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const loanId = ctx
    .checkParams('id')
    .trim()
    .notEmpty(ErrMsg.isProductEmptyId)
    .isInt()
    .toInt().value;
  const query = {
    loanId,
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }

  let loanAgreementVal;
  try {
    loanAgreementVal = await service.account.fetch(
      query,
      'accountLoanAgreement'
    );
    var hasFile = _.get(loanAgreementVal, 'hasFile') || false;
    if (!hasFile) {
      throw 500;
    }
    var filePath = _.get(loanAgreementVal, 'filePath') || '';
    if (filePath && filePath.length) {
      ctx.redirect(filePath);
      return;
    } else {
      throw 404;
    }
  } catch (error) {
    ctx.throw(error);
  }
  await next();
};
account.transferAgreement = async(ctx, next) => {
  const service = ctx.service;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const transferLogId = ctx
    .checkParams('id')
    .trim()
    .notEmpty(ErrMsg.def)
    .isInt()
    .toInt().value;
  const query = {
    transferLogId,
    ipAddress,
    platform,
    userId
  };
  let transferAgreementVal;
  try {
    transferAgreementVal = await service.account.fetch(
      query,
      'accountTransferAgreement'
    );
    var hasFile = _.get(transferAgreementVal, 'hasFile') || false;
    if (!hasFile) {
      throw 500;
    }
    var filePath = _.get(transferAgreementVal, 'filePath') || '';
    if (filePath && filePath.length) {
      ctx.redirect(filePath);
      return;
    } else {
      throw 404;
    }
  } catch (error) {
    ctx.throw(error);
  }
  await next();
};
account.message = async(ctx, next) => {
  var success = _.clone(AJAX_SUCCESS);
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const ids = ctx.checkBody('msgid').value;

  if (ctx.method === HTTP_POST) {
    if (!ids) {
      return;
    }
    var postQuery = {
      ids,
      userId,
      ipAddress,
      platform
    };

    var ret = JSON.parse(await ctx.proxy.accountMessageIsRead(postQuery));
    if (!ret || ret.status !== 0) {
      return;
    }
    ctx.body = success;
  }
  //message list
  var data = util.getListPageData.call(ctx);
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page=',
    pageTotal: 0,
    pageSize: data.pageSize
  });

  var query = {
    pageNumber: data.pageNumber,
    pageSize: 10,
    userId,
    ipAddress,
    platform
  };

  await ctx.proxy.accountMessageList(query).then(function(value) {
    if (!value) {
      ctx.addError('page', ErrMsg.def);
      return;
    }
    var ret = JSON.parse(value);
    if (!ret || ret.status !== 0) {
      //ctx.throw(404);
      ctx.addError('page', ret.message);
      return;
    }
    var size = _.get(ret, 'data.pageSize');
    var total = _.get(ret, 'data.totalCount');
    var count = util.pageCount(total, size);

    _.extend(ctx.state, {
      dataList: _.get(ret, 'data.dataList') || [],
      totalCount: total,
      pageTotal: count
    });
  });
  await next();
};
account.withdraw = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var _realName = _.get(ctx.state, 'userState.realName') || '';
  var _userAvailableBalance;
  var _data;
  var _step;
  var _flag = 0;
  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = _data;
    ctx.state.step = _step;
  };
  var userAssetsData = {
    userId,
    ipAddress,
    platform
  };
  await Promise.all([
    ctx.proxy.getAccountAssest(userAssetsData),
    //ctx.proxy.accountWithdrawTime(userAssetsData)
    ctx.proxy.accountWithDrawUserCard({
      userId,
      ipAddress,
      platform
    }),
    ctx.proxy.accountWithdrawCount(userAssetsData)
  ]).then(
    function(values) {
      if (!values[0] || !values[1] || !values[2]) {
        ctx.addError('page', ErrMsg.def);
        return;
      }

      _userAvailableBalance = ctx.state.accountAvailableBalance =
        _.get(JSON.parse(values[0]), 'data.availablePoint') - 0 || 0;
      ctx.state.userCard = _.get(JSON.parse(values[1]), 'data.userBank') || {};
      ctx.state.accountwithdrawCount =
        _.get(JSON.parse(values[2]), 'data.inprocessCount') - 0 || 0;
    },
    function(error) {
      ctx.addError('page', ErrMsg.def || error);
      return;
    }
  );

  if (ctx.method === HTTP_POST) {
    var _step = ctx.checkBody('step').value;
    if (_step === 'nextStep') {
      var _amount = ctx
        .checkBody('amount')
        .notEmpty(ErrMsg.isEmptyCharge)
        .trim().value;

      _step = 'confirm';
      ctx.state.amount = _amount;
      _render();
      return await next();
    } else {
      var _amount = ctx
        .checkBody('amount')
        .notEmpty(ErrMsg.isEmptyCharge)
        .trim().value;
      var _smscode = ctx
        .checkBody('smscode')
        .notEmpty(ErrMsg.emptyCode)
        .trim().value;
      var _data = {
        bankno: ctx.checkBody('bankno').value || '',
        accntno: ctx.checkBody('cardid').trim().value || '',
        amt: util.toFixed(ctx.checkBody('amount').value, 2),
        accntnm: _realName,
        userId,
        ipAddress,
        platform,
        mobileVerificationCode: _smscode
      };
      ctx.state.amount = _amount;

      if (ctx.errors) {
        _step = 'confirm';
        _render();
        return await next();
      }
      if (_flag) {
        return await next();
      }
      if (_data.amt < 1) {
        ctx.addError('amount', ErrMsg.withdrawError);
        _render();
        return await next();
      }
      if (_data.amt > _userAvailableBalance) {
        ctx.addError('page', ErrMsg.isAmountError);
        _render();
        return await next();
      }

      await ctx.proxy.accountWithDraw(_data).then(function(value) {
        logger.info('account.withdraw.result', value);
        if (!value) {
          ctx.addError('page', ErrMsg.def);
          _step = 'confirm';
          _render();
          return;
        }
        var ret = JSON.parse(value);
        if (ret.status !== 0) {
          ctx.addError('page', ret.message);
          _step = 'confirm';
          _render();
          return;
        }
        _flag = 1;
        ctx.state.amount = _data.amt;
        ctx.state.accountWithDrawTime = _.get(ret, 'data.arrivalTime');
        ctx.state.isSuccess = 1;
        ctx.state.isResult = 1;
        _render();
        return;
      });
    }
  }
  _render();
  await next();
};

account.withdrawList = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var pageData = util.getListPageData.call(ctx);
  _.extend(ctx.state, {
    page: pageData.pageNumber,
    pageUrl: '?page=',
    pageTotal: 0,
    pageSize: pageData.pageSize
  });
  const data = {
    userId,
    ipAddress,
    platform,
    pageNumber: pageData.pageNumber,
    pageSize: pageData.pageSize
  };

  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return next();
  }

  await ctx.proxy.accountWithdrawList(data).then(
    function(val) {
      if (!val) {
        ctx.addError('page', ErrMsg.def);
        return;
      }
      var ret = JSON.parse(val);
      if (!ret || ret.status != 0) {
        ctx.addError('page', ret.message || ErrMsg.def);
        return;
      }

      var total = _.get(ret, 'data.totalCount', 0) - 0;
      var count = util.pageCount(total, data.pageSize);
      _.extend(ctx.state, {
        dataList: _.get(ret, 'data.dataList') || [],
        totalCount: total,
        pageTotal: count
      });
    },
    function(error) {
      logger.error('account.withdrawList', error);
    }
  );
  await next();
};

account.charge = async(ctx, next) => {
  const service = ctx.service;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var baofu = util.setting.baofu;
  ctx.state.ebankCode = _.get(ctx.session, 'ebankCode', 3002);

  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = data;
  };

  var data = {
    userId,
    ipAddress,
    platform
  };

  let assetValue;
  try {
    assetValue = await service.account.fetch(data, 'asset');
    ctx.state.accountAvailableBalance =
      _.get(assetValue, 'availablePoint') - 0 || 0;
  } catch (error) {
    ctx.addError('page', error._message || ErrMsg.def);
    return;
  }

  if (ctx.method === HTTP_POST) {
    var _amount = ctx
      .checkBody('amount')
      .notEmpty(ErrMsg.isEmptyCharge)
      .trim().value;
    data.bankCode = ctx
      .checkBody('bankId')
      .notEmpty(ErrMsg.isEmpTyBankNo)
      .len(2, 6, ErrMsg.isEmpTyBankNo)
      .trim().value;

    if (ctx.errors) {
      _render();
      return await next();
    }
    Object.assign(data, {
      returnUrl: ctx.origin + baofu.pageNotifyUrl,
      notifyUrl: baofu.backNotifyUrl,
      amt: util.toFixed(_amount, 2),
      cardNo: ''
    });
    let value;
    try {
      value = await service.account.query(data, 'accountRecharge');
      ctx.state = {
        dataInfo: _.get(value, 'recharge') || {},
        notifyUrl: baofu.backNotifyUrl,
        originUrl: ctx.origin,
        tpl: 'account.charge.confirm.pug'
      };
      ctx.session.stashBankCode = data.bankCode;
    } catch (error) {
      ctx.state.query = data;
      ctx.addError('page', error._message || ErrMsg.def);
    }
    return await next();
  }
  await next();
};

account.chargeResult = async(ctx, next) => {
  const factMoney = ctx.checkQuery('FactMoney').value;
  const result = ctx.checkQuery('Result').value;
  // const service = ctx.service;
  // var _plat_no = ctx.checkBody('plat_no').value,
  //     _order_no = ctx.checkBody('order_no').value,
  //     _platcust = ctx.checkBody('platcust').value,
  //     _type = ctx.checkBody('type').value,
  //     _order_amt = ctx.checkBody('order_amt').value,
  //     _trans_date = ctx.checkBody('trans_date').value,
  //     _trans_time = ctx.checkBody('trans_time').value,
  //     _pay_order_no = ctx.checkBody('pay_order_no').value,
  //     _pay_finish_date = ctx.checkBody('pay_finish_date').value,
  //     _order_status = ctx.checkBody('order_status').value,
  //     _pay_amt = ctx.checkBody('pay_amt').value,
  //     _error_info = ctx.checkBody('error_info').value,
  //     _error_no = ctx.checkBody('error_no').value,
  //     _signdata = ctx.checkBody('signdata').value,
  //     _host_req_serial_no = ctx.checkBody('host_req_serial_no').value,
  //     _userId = _.get(ctx.state, 'user.id') - 0 || 0;

  // var _data = {
  //   plat_no:  _plat_no,
  //   order_no: _order_no,
  //   platcust: _platcust,
  //   type: _type,
  //   order_amt: _order_amt,
  //   trans_date: _trans_date,
  //   trans_time: _trans_time,
  //   pay_order_no: _pay_order_no,
  //   pay_finish_date: _pay_finish_date,
  //   order_status: _order_status,
  //   pay_amt: _pay_amt,
  //   error_info: _error_info,
  //   error_no: _error_no,
  //   signdata: _signdata,
  //   host_req_serial_no: _host_req_serial_no,
  //   userId: _userId,
  //   ipAddress: ctx.ip,
  //   platform: 'PC'
  // };

  // try {
  //   await service.account.update(_data, 'accountRechargeResultDeal');
  // } catch (error) {
  //   logger.warn('account.recharge.baofu.callback.error', error);
  // }

  if (!result) {
    ctx.state.isResult = 0;
    return await next();
  }
  ctx.state.isResult = 1;
  ctx.state.orderAmount = util.toFixed(factMoney, 2);
  ctx.session.ebankCode = _.get(ctx.session, 'stashBankCode', 0);
  await next();
};

account.bankAdd = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var data;
  var referer, _url, _host;
  var WEB_HOST = ctx.hostname;
  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = data;
  };
  ctx.state.bankTips = util.bankTips;
  ctx.state.bankCodeList = util.bankCodeList;
  if (ctx.method === HTTP_POST) {
    data = {
      bankCode: ctx
        .checkBody('bankcode')
        .notEmpty(ErrMsg.isBankIdEmpty)
        .trim().value,
      bankNum: ctx
        .checkBody('bank')
        .notEmpty(ErrMsg.isEmpTyBankNo)
        .trim()
        .replace(/\s/g, '').value,
      preMobile: ctx
        .checkBody('mobile')
        .notEmpty(ErrMsg.emptyMobile)
        .trim().value,
      userId,
      ipAddress,
      platform
    };
    if (ctx.errors) {
      _render();
      return await next();
    }

    var value = await ctx.proxy.accountSingleBindCard(data);
    if (!value) {
      ctx.addError('page', ErrMsg.def);
      _render();
      return await next();
    }
    var ret = JSON.parse(value);
    if (!ret || ret.status !== 0) {
      // ctx.state.errorMessage = ret.message;
      ctx.addError('page', ret.message);

      _render();
      return await next();
    }
    ctx.state.reurl = _url;
    ctx.state.isBankAddSuccess = 1;
    ctx.state.tpl = 'account.bank.add.result.pug';
    return await next();
  }
  referer = ctx.get('Referer');
  _host = url.parse(referer).hostname;
  WEB_HOST === _host ? (_url = url.parse(referer).pathname) : (_url = '/');

  await next();
};
account.quickpay = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var data;
  var _flag = 0;
  var _step;
  var _render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = data;
    ctx.state.step = _step;
  };
  var userAssetsData = {
    userId,
    ipAddress,
    platform
  };
  ctx.state.bankTips = util.bankTips;
  await Promise.all([
    ctx.proxy.getAccountAssest(userAssetsData),
    ctx.proxy.accountWithDrawUserCard({
      userId,
      ipAddress,
      platform
    })
  ]).then(
    function(values) {
      _.extend(ctx.state, {
        accountAvailableBalance:
          (values[0] && _.get(JSON.parse(values[0]), 'data.availablePoint')) ||
          0,
        userCard:
          (values[1] && _.get(JSON.parse(values[1]), 'data.userBank')) || ''
      });
    },
    function(error) {
      ctx.throw(error);
    }
  );
  if (ctx.method === HTTP_POST) {
    var _step = ctx.checkBody('step').value;
    if (_step === 'nextStep') {
      var _amount = ctx
        .checkBody('amount')
        .notEmpty(ErrMsg.isEmptyCharge)
        .trim().value;

      _step = 'confirm';
      ctx.state.amount = _amount;
      _render();
      return await next();
    } else {
      // var _smscode = ctx.checkBody('smscode').notEmpty(ErrMsg.isEmptyCharge).trim().value;
      // var _orderId = ctx.checkBody('orderNo').value;
      var _amount = ctx.checkBody('amount').value;
      var data = {
        mobileVerificationCode: ctx
          .checkBody('smscode')
          .notEmpty(ErrMsg.emptyCode)
          .trim().value,
        amt: util.toFixed(_amount, 2),
        //origin_order_no: _orderId,
        userId,
        ipAddress,
        platform
      };
      ctx.state.amount = _amount;
      logger.info('account.confirm.data', data);
      if (ctx.errors) {
        _step = 'confirm';
        _render();
        return await next();
      }
      if (_flag) {
        return await next();
      }
      await ctx.proxy.quickPay(data).then(
        function(value) {
          if (!value) {
            ctx.addError('page', ErrMsg.def);
            _step = 'confirm';
            _render();
            return;
          }
          var ret = JSON.parse(value);
          if(ret.status === 2){
            ctx.session.chargeInfo = {
              isInHand: 1,
              orderMessage: ret.message
            };
            ctx.redirect('/account/quickpay/result');
            return;
          }
          if(ret.status !== 0){
            ctx.addError('page', ret.message);
            _step = 'confirm';
            _render();
            return;
          }
          ctx.session.chargeInfo = {
            isResult: 1,
            orderAmount: _amount
          };
          _flag = 1;
          ctx.session.lastsms = 0;
          ctx.redirect('/account/quickpay/result');
        },
        function() {
          ctx.session.chargeInfo = {
            isInHand: 1,
            orderMessage: ErrMsg.chargeResponseTimeout
          };
          ctx.redirect('/account/quickpay/result');
        }
      );
    }
  }
  _render();
  return await next();
};
account.amountSmscode = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var amount = ctx.checkBody('amount').value;
  var action = ctx.checkParams('action').value || '';
  var last = _.get(ctx.session, 'lastsms', 0) - 0;
  var interval = 56 * 1000; // 60sec

  var data = {
    amount: util.toFixed(amount, 2) || 0,
    // mobile: _mobile || '',
    // notify_url: '',
    userId,
    ipAddress,
    platform,
    type: ctx.checkBody('type').value || ''
  };

  if (Date.now() - last < interval) {
    err.message = ErrMsg.quickSmsCode;
    ctx.body = err;
    return await next();
  }
  var interFace;
  if (action == 'quickpay') interFace = 'quickPaySmsCode';
  else if (action == 'withdraw') interFace = 'withdrawSmsCode';
  // else if (action == 'quickpayvoice') interFace = 'getVoiceSmscode';
  await ctx.proxy[interFace](data).then(
    function(val) {
      if (!val) {
        err.message = ErrMsg.def;
        ctx.body = err;
        return;
      }
      var ret = JSON.parse(val);
      if (ret.status !== 0) {
        err.message = ret.message;
        ctx.body = err;
        return;
      }
      success.data = _.get(ret, 'data') || '';
      ctx.body = success;
    },
    function() {
      err.message = ErrMsg.def;
      ctx.body = err;
    }
  );
  ctx.session.lastsms = Date.now();
  await next();
};

account.withdrawSmscode = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var err = _.clone(AJAX_ERROR);
  var success = _.clone(AJAX_SUCCESS);
  var _amount = ctx.checkBody('amount').trim().value;
  var last = _.get(ctx.session, 'lastsms', 0) - 0;
  var interval = 56 * 1000; // 60sec

  var _data = {
    amount: util.toFixed(_amount, 2) || 0,
    // mobile: _mobile || '',
    // notify_url: '',
    userId,
    ipAddress,
    platform
  };

  if (Date.now() - last < interval) {
    err.message = ErrMsg.quickSmsCode;
    ctx.body = err;
    return await next();
  }
  await ctx.proxy.withdrawSmscode(_data).then(
    function(val) {
      if (!val) {
        err.message = ErrMsg.def;
        ctx.body = err;
        return;
      }
      var ret = JSON.parse(val);
      if (ret.status !== 0) {
        err.message = ret.message;
        ctx.body = err;
        return;
      }
      success.data = _.get(ret, 'data') || '';
      ctx.body = success;
    },
    function() {
      err.message = ErrMsg.def;
      ctx.body = err;
    }
  );
  ctx.session.lastsms = Date.now();
  await next();
};

account.transferAffirm = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var _loanId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  var _currentTransValue;
  var _data = {
    loanId: _loanId,
    userId,
    ipAddress,
    platform
  };
  if (ctx.errors) {
    ctx.state.errors = ctx.errors;
    return await next();
  }
  await ctx.proxy.accountLoanTransfer(_data).then(
    function(val) {
      if (!val) {
        ctx.addError('page', ErrMsg.def);
        return;
      }

      var ret = JSON.parse(val);
      if (ret.status !== 0) {
        ctx.addError('page', ret.message);
        ctx.state.isError = 1;
        return;
      }
      ctx.state.transferData = _.get(ret, 'data');
      _currentTransValue = _.get(ret, 'data.currentTransValue') - 0 || 0;
    },
    function() {
      return;
    }
  );
  if (ctx.method === HTTP_POST) {
    var _cashPassword = ctx
      .checkBody('cashPassword')
      .trim()
      .notEmpty(ErrMsg.isEmptyTradPwd).value;
    var _data = {
      loanId: _loanId,
      cashPassword: _cashPassword,
      currentTransferValue: _currentTransValue,
      userId,
      ipAddress,
      platform
    };

    await ctx.proxy.accountTransferResult(_data).then(
      function(val) {
        if (!val) {
          ctx.addError('page', ErrMsg.def);
          return;
        }
        var ret = JSON.parse(val);
        if (ret.status != 0) {
          ctx.addError('page', ret.message);
          return;
        }
        ctx.redirect('/account/transfer/result/' + _loanId + '/success');
      },
      function() {}
    );
    return await next();
  }
  await next();
};
account.loanListDropdown = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var _filter = getFilter.call(ctx);
  var _loanId = ctx
    .checkBody('loanId')
    .isInt()
    .toInt().value;
  var _data = {
    loanId: _loanId,
    userId,
    ipAddress,
    platform
  };

  var loanType = filterToData(_filter).type;
  ctx.state.loanType = loanType;
  await (loanType == 'FINISH_LOAN' ?
    ctx.proxy.transferFinishDetail(_data) :
    ctx.proxy.transferRepayingDetail(_data)
  ).then(function(val) {
    if (!val) {
      ctx.addError('dropdown', ErrMsg.def);
      return;
    }
    var ret = JSON.parse(val);
    if (ret.status != 0) {
      ctx.state.error = ret.message;
      return;
    }
    ctx.state.dataList = _.get(ret, 'data.dataList') || [];
  });
  await next();
};
account.planListDropdown = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var _loanId = ctx
    .checkBody('loanId')
    .isInt()
    .toInt().value;
  var _loanFinancePlanSubpointId = ctx
    .checkBody('financePlanSubpointId')
    .isInt()
    .toInt().value;
  var _data = {
    loanId: _loanId,
    financePlanSubpointId: _loanFinancePlanSubpointId,
    userId,
    ipAddress,
    platform
  };

  await ctx.proxy.financeplanLoanOwner(_data).then(function(val) {
    if (!val) {
      ctx.addError('dropdown', ErrMsg.def);
      return;
    }
    var ret = JSON.parse(val);
    if (ret.status != 0) {
      ctx.state.error = ret.message;
      return;
    }
    ctx.state.dataList = _.get(ret, 'data.dataList') || [];
  });
  await next();
};
//coupon
account.couponList = async(ctx, next) => {
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  var total;
  var size;
  var _data = {
    pageNumber: ctx.checkBody('pageNumber').value - 0 || 1,
    status: ctx.checkBody('type').value || 'AVAILABLE',
    pageSize: 9,
    userId,
    ipAddress,
    platform
  };
  Object.assign(ctx.state, {
    pageNumber: _data.pageNumber,
    pageSize: _data.pageSize,
    pageUrl: '?page=',
    page: _data.pageNumber
  });
  var value = await ctx.proxy.accountCouponList(_data);
  if (!value) {
    return;
  }
  var ret = JSON.parse(value);
  if (!ret || ret.status !== 0) {
    return;
  }
  total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
  size = _.get(ret, 'data.pageSize', 0) - 0 || 0;
  ctx.state.dataList = _.get(ret, 'data.dataList') || [];
  ctx.state.pageTotal = util.pageCount(total, size);
  await next();
};

account.unbindBankCard = async(ctx, next) => {
  const service = ctx.service;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var render = function() {
    ctx.state.errors = ctx.errors || [];
    ctx.state.query = data;
  };

  var data = {
    userId,
    ipAddress,
    platform
  };

  await ctx.proxy.accountWithDrawUserCard(data).then(
    function(value) {
      if (!value) {
        ctx.addError('page', ErrMsg.def);
        return;
      }
      var ret = JSON.parse(value);
      if (!ret.data.enableUnbind) {
        ctx.redirect('/account/setting');
        return;
      }
      ctx.state.userCard = _.get(ret, 'data.userBank') || '';
    },
    function(error) {
      ctx.addError('page', ErrMsg.def || error);
      return;
    }
  );

  if (ctx.method === HTTP_POST) {
    data.idNo = ctx
      .checkBody('identityNo')
      .notEmpty(ErrMsg.emptyIdentity)
      .trim().value;
    data.cashPassword = ctx
      .checkBody('tradPassword')
      .notEmpty(ErrMsg.isEmptyTradPwd)
      .trim().value;

    if (ctx.errors) {
      render();
      return await next();
    }

    try {
      await service.account.update(data, 'bankcard/unbind');
      ctx.state.isResult = 'success';
    } catch (error) {
      ctx.state.query = data;
      if (error._status === 4002) {
        ctx.state.isResult = 'error';
        ctx.state.orderMessage = error._message;
        return await next();
      }
      ctx.addError('page', error._message);
    }
    return await next();
  }

  await next();
};

account.invite = async(ctx, next) => {
  const service = ctx.service.account;

  const userType = _.get(ctx.state, 'userState.inviteRole', '');
  const isShowInviteFriend = _.get(ctx.state, 'userState.isShowInviteFriend');
  const {
    userId,
    ipAddress,
    platform,
    pageSize,
    pageNumber
  } = ctx.args;

  if (userType == 'SALES' || isShowInviteFriend == '0') {
    ctx.redirect('/account');
  }
  const query = {
    userId,
    ipAddress,
    platform,
    pageNumber,
    pageSize
  };

  let values;
  let inviteDetailData;
  let dataList;
  let size;
  let count;

  try {
    values = await Promise.all([
      service.fetch(query, 'inviteCount'),
      service.query(query, 'inviteList')
    ]);
    inviteDetailData = _.get(values, '[0]');
    dataList = _.get(values, '[1].dataList', []);
    size = _.get(values, '[1].pageSize') || 20;
    count = _.get(values, '[1].totalCount') || 0;
  } catch (error) {
    ctx.addError('page', error._message || ErrMsg.def);
    return await next();
  }
  Object.assign(ctx.state, {
    dataList,
    inviteDetailData,
    pageTotal: util.pageCount(count, size)
  });

  await next();
};

account.inviteAjaxList = async(ctx, next) => {
  const data = util.getListPageData.call(ctx);
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page='
  });
  const _data = {
    pageSize: data.pageSize,
    pageNumber: data.pageNumber,
    userId,
    ipAddress,
    platform
  };
  await ctx.proxy.inviteList(_data).then(
    function(value) {
      if (!value) {
        ctx.addError('page', ErrMsg.def);
        return;
      }
      const listData = JSON.parse(value);
      if (listData.status != 0) {
        ctx.addError('noResult', listData.message);
        return;
      }
      const total = _.get(listData, 'data.totalCount', 0) - 0;
      const pageSize = _.get(listData, 'data.pageSize', 0) - 0;
      const count = util.pageCount(total, pageSize);
      _.extend(ctx.state, {
        dataList: _.get(listData, 'data.dataList', []),
        totalCount: total,
        pageTotal: count
      });
    },
    function(error) {
      ctx.addError('page', error);
      return;
    }
  );
  await next();
};

account.planExit = async(ctx, next) => {
  const service = ctx.service.account;

  const financePlanId = ctx
    .checkParams('id')
    .trim()
    .notEmpty(ErrMsg.def)
    .isInt()
    .toInt().value;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var data = {
    financePlanId,
    userId,
    ipAddress,
    platform
  };
  var ret;

  try {
    ret = await service.update(data, 'quit/confirm');
    ctx.state.planQuitData = ret;
  } catch (error) {
    ctx.addError('page', error);
  }

  if (ctx.method === HTTP_POST) {
    data.smsCode = ctx
      .checkBody('smscode')
      .notEmpty(ErrMsg.emptyCode)
      .trim().value;
    try {
      ret = await service.update(data, 'quit');
      _.extend(ctx.state, {
        quitTime: ret.endLockingTime - 0,
        financePlanId: financePlanId,
        result: 1
      });
    } catch (error) {
      ctx.addError('page', error._message);
    }
  }
  await next();
};

account.planExitCancle = async(ctx, next) => {
  const service = ctx.service.account;
  const financePlanId = ctx
    .checkBody('id')
    .trim()
    .notEmpty(ErrMsg.def)
    .isInt()
    .toInt().value;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const data = {
    userId,
    ipAddress,
    platform,
    financePlanId
  };
  var ret;

  try {
    ret = await service.update(data, 'quit/cancle');
    ctx.dumpJSON(ret);
  } catch (error) {
    ctx.dumpJSON(400, error._message);
  }
};

account.planExitConfirm = async(ctx, next) => {
  const service = ctx.service;
  const financePlanId = ctx
    .checkBody('id')
    .trim()
    .notEmpty(ErrMsg.def)
    .isInt()
    .toInt().value;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var data = {
    financePlanId,
    userId,
    ipAddress,
    platform
  };
  var ret;

  try {
    ret = await service.account.update(data, 'quit/confirm');
    ctx.dumpJSON(ret);
  } catch (error) {
    ctx.dumpJSON(400, error._message);
  }
};

account.planJoinExit = async(ctx, next) => {
  const service = ctx.service.account;

  const financePlanId = ctx.checkParams('id').value;
  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  var data = {
    financePlanId,
    userId,
    ipAddress,
    platform
  };
  var ret;
  ctx.state.financePlanId = financePlanId;

  try {
    ret = await service.update(data, 'join/cancle/confirm');
    ctx.state.planJoinQuitData = ret;
  } catch (error) {
    if (error._status == 1001) {
      ctx.state.result = 'overtime';
    } else {
      ctx.addError('page', error);
    }
  }

  if (ctx.method === HTTP_POST) {
    data.smsCode = ctx.checkBody('smscode').value;
    try {
      ret = await service.update(data, 'join/cancle');
      _.extend(ctx.state, {
        planName: ret.financePlanName,
        result: 'success'
      });
    } catch (error) {
      if (error._status == 1001) {
        ctx.state.result = 'overtime';
      } else {
        ctx.addError('page', error._message);
      }
    }
  }
  await next();
};

module.exports = account;