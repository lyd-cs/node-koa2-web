'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');

const { _, BUY_TYPE, BUY_CONFIRM_ERROR, AJAX_ERROR } = util;

const loan = async(ctx, next) => {
  await next();
};

loan.list = async(ctx, next) => {
  var data = util.getListPageData.call(ctx);
  const { userId, ipAddress, platform } = ctx.args;
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page=',
    pageTotal: 0,
    pageSize: data.pageSize
  });
  const _data = {
    version: '1.0',
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    userId,
    ipAddress,
    platform
  };
  ctx.state.page_keywords = util.loanKeyWords;
  ctx.state.page_description = util.loanDesc;

  await ctx.proxy.loanList(_data).then(
    function(value) {
      if (!value) {
        ctx.addError('page', ErrMsg.def);
        return;
      }
      const ret = JSON.parse(value);
      if (!ret || ret.status !== 0) {
        return;
      }
      var total = _.get(ret, 'data.totalCount');
      var size = _.get(ret, 'data.pageSize');
      var count = util.pageCount(total, size);

      _.extend(ctx.state, {
        dataList: _.get(ret, 'data.dataList') || [],
        totalCount: total,
        pageTotal: count
      });
    },
    function() {}
  );

  await next();
};

loan.detail = async(ctx, next) => {
  const loanId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  const { userId, platform, ipAddress } = ctx.args;
  const _data = {
    userId,
    ipAddress,
    platform,
    loanId: loanId,
    version: '1.0'
  };
  ctx.state.page_description = util.loanDesc;
  await Promise.all([
    ctx.proxy.loanDetail(_data),
    ctx.state.isLogin
      ? ctx.proxy.userAssets({
          userId,
          ipAddress,
          platform
        })
      : null
  ]).then(
    function(values) {
      const ret = JSON.parse(values[0]);
      const ret1 = JSON.parse(values[1]);
      if (!ret || ret.status !== 0) {
        //ctx.throw(406);
        //ctx.state.tpl = '40x.pug';
        ctx.status = 406;
        //ctx.assert(ret, 406);
        return;
      }
      _.extend(ctx.state, {
        dataDetail: _.get(ret, 'data'),
        loanAmount: _.get(ret1, 'data.point')
      });
    },
    function() {
      ctx.throw(406);
    }
  );
  await next();
};

loan.postInvestRecord = async(ctx, next) => {
  const _loanId = ctx
    .checkBody('loanId')
    .isInt()
    .toInt().value;
  const { userId, ipAddress, platform } = ctx.args;
  const _data = {
    loanId: _loanId,
    version: '1.0',
    userId,
    ipAddress,
    platform
  };
  await ctx.proxy.loanInvestRecord(_data).then(
    function(value) {
      const ret = JSON.parse(value);
      if (!ret || ret.status !== 0) {
        ctx.addError('page', ret.message);
        return;
      }
      ctx.state.investRecord = _.get(ret, 'data.loanLenderRecord_list') || [];
      ctx.state.userName = _.get(ctx.state, 'user.name') || '';
      ctx.state.investCount = _.get(ret, 'data.joinCount') - 0 || 0;
    },
    function() {}
  );

  await next();
};

loan.postRefundPlan = async(ctx, next) => {
  const _loanId = ctx
    .checkBody('loanId')
    .isInt()
    .toInt().value;
  const { userId, ipAddress, platform } = ctx.args;
  const _data = {
    loanId: _loanId,
    userId,
    ipAddress,
    platform
  };
  const ret = JSON.parse(await ctx.proxy.loanRefundPlan(_data));
  if (!ret || ret.status !== 0) {
    return await next();
  }
  ctx.state.refundPlan = _.get(ret, 'data.borrowRepayRecord_list') || [];
  await next();
};

loan.buyConfirm = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;
  const loanId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;

  const data = {
    userId,
    ipAddress,
    platform,
    loanId: loanId,
    bidAmount: ctx.checkBody('amount').trim().value,
    riskType: ctx.checkBody('risktype').value,
    version: '1.0'
  };
  await Promise.all([
    ctx.proxy.loanConfirm(data),
    ctx.state.isLogin ? ctx.proxy.userAssets(data) : null,
    ctx.proxy.accountWithDrawUserCard(data)
  ]).then(
    function(value) {
      var _buyResult = JSON.parse(value[0]);
      if (_buyResult.status !== 0) {
        _.extend(ctx.state, {
          errorMessage: _.get(_buyResult, 'message') || [],
          errorCode: _.get(_buyResult, 'status') || []
        });
        return;
      }
      _.extend(ctx.state, {
        buyResult: _.get(_buyResult, 'data') || [],
        userAssets:
          (value[1] && _.get(JSON.parse(value[1]), 'data.point')) || '',
        userCard:
          (value[2] && _.get(JSON.parse(value[2]), 'data.userBank')) || ''
      });
    },
    function() {}
  );
  ctx.state.loanId = loanId;
  await next();
};

loan.buyResult = async(ctx, next) => {
  const _amount = ctx.checkBody('amount').trim().value;
  const _loanId = ctx.checkBody('loanid').trim().value;
  //const _userId = _.get(ctx.state.user, 'id', 0) - 0 || 0;
  // const _data = {
  //   userId: _userId,
  //   loanId: _loanId,
  //   bidAmount: _amount,
  //   ipAddress: ctx.ip,
  //   platform: 'PC'
  // };
  ctx.state.productId = _loanId;
  ctx.state.amount = _amount;
  ctx.state.isTransfer = 0;
  // await ctx.proxy.loanBuyResult(_data)
  //   .then(function(val) {
  //     if(!val){
  //       _.extend(ctx.state, {
  //         errorMessage: _.get(ret, 'message') || [],
  //         errorCode: _.get(ret, 'status') || []
  //       })
  //       return;
  //     }
  //     ctx.state.loanId= _data.loanId;
  //     var ret = JSON.parse(val);
  //     if (ret.status !== 0) {
  //       ctx.state.isSuccess = 0;
  //       _.extend(ctx.state, {
  //         errorMessage: _.get(ret, 'message') || [],
  //         errorCode: _.get(ret, 'status') || []
  //       });
  //       return;
  //     }
  //     ctx.state.isSuccess = 1;
  //      _.extend(ctx.session, {
  //       isTransfer: 0
  //     })
  //     ctx.redirect('/loan/' + _loanId + '/success');
  //   }, function(err) {
  //   })
  await next();
};

loan.buyBack = async(ctx, next) => {
  var err = _.clone(AJAX_ERROR);
  const { userId, platform, ipAddress } = ctx.args;
  const loanId = ctx.checkBody('productId').trim().value;
  const buytype = ctx.checkBody('buyType').value || '';
  const data = {
    userId,
    ipAddress,
    platform,
    loanId: loanId,
    version: '1.0',
    bidAmount: ctx.checkBody('amount').notEmpty(ErrMsg.isAmount).value,
    buyType: BUY_TYPE[buytype],
    password:
      buytype === 'BALANCE'
        ? ctx
            .checkBody('password')
            .notEmpty(ErrMsg.emptyPwd)
            .trim().value
        : '',
    balanceAmount:
      buytype === 'RECHARGE' ? ctx.checkBody('balanceAmount').value || '' : '',
    smsCode:
      buytype === 'RECHARGE'
        ? ctx
            .checkBody('smsCode')
            .notEmpty(ErrMsg.isEmptySmsCode)
            .trim().value
        : '',
    willingToBuy: ctx.checkBody('willingToBuy').value ? '1' : '0'
  };
  if (ctx.errors) {
    err.data = ctx.errors;
    ctx.body = err;
    return;
  }
  ctx.state.loanId = loanId;
  await ctx.proxy.loanBuyResult(data).then(
    function(val) {
      ctx.state.loanId = data.loanId;
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
      if (ret.status !== 0) {
        ctx.state.isSuccess = 0;
        _.extend(ctx.state, {
          errorMessage: _.get(ret, 'message') || [],
          errorCode: _.get(ret, 'status') || []
        });
        return next();
      }
      _.extend(ctx.state, {
        isSuccess: 1,
        isTransfer: 0
      });
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

loan.transfer = async(ctx, next) => {
  var data = util.getListPageData.call(ctx);
  const { userId, ipAddress, platform } = ctx.args;
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: '?page=',
    pageTotal: 0,
    pageSize: data.pageSize
  });
  const _data = {
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    userId,
    ipAddress,
    platform
  };
  await ctx.proxy.transferList(_data).then(
    function(value) {
      if (!value) {
        ctx.addError('page', ErrMsg.def);
        return;
      }
      const ret = JSON.parse(value);
      if (!ret || ret.status !== 0) {
        return;
      }
      var total = _.get(ret, 'data.totalCount');
      var size = _.get(ret, 'data.pageSize');
      var count = util.pageCount(total, size);

      _.extend(ctx.state, {
        dataList: _.get(ret, 'data.dataList') || [],
        totalCount: total,
        pageTotal: count
      });
    },
    function() {}
  );

  await next();
};

loan.transferDetail = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;
  const data = {
    userId,
    ipAddress,
    platform,
    loanTransferId: ctx
      .checkParams('id')
      .isInt()
      .toInt().value
  };
  await Promise.all([
    ctx.proxy.transferDetail(data),
    ctx.state.isLogin
      ? ctx.proxy.userAssets({
          userId,
          ipAddress,
          platform
        })
      : null
  ]).then(
    function(values) {
      const ret = JSON.parse(values[0]);
      const ret1 = JSON.parse(values[1]);
      if (!ret || ret.status !== 0) {
        ctx.status = 406;
        return;
      }
      var loanStatus = _.get(ret, 'data.loanVo.status');
      var _state = util.parseLoanStatus(loanStatus);
      var isFirstApply = _state.first_apply;
      if (isFirstApply) {
        //ctx.throw(406);
        ctx.status = 406;
        return;
      }
      _.extend(ctx.state, {
        dataDetail: _.get(ret, 'data'),
        loanAmount: _.get(ret1, 'data.point')
      });
    },
    function() {
      ctx.throw(406);
    }
  );
  await next();
};

loan.debtList = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  const data = {
    loanTransferId: ctx.checkBody('transferId').value - 0 || 0,
    loanId: ctx.checkBody('loanId').value - 0 || 0,
    userId,
    ipAddress,
    platform
  };
  let ret;
  let debtMethod;
  var method = {
    loanTransferId: 'transferDebtList',
    loanId: 'loanDebtRecord'
  };
  if (!data.loanId && !data.loanTransferId) {
    return;
  }
  debtMethod = data.loanTransferId ? method.loanTransferId : method.loanId;
  ret = JSON.parse(await ctx.proxy[debtMethod](data));
  if (!ret || ret.status !== 0) {
    return await next();
  }
  ctx.state.dataList = _.get(ret, 'data.dataList') || [];
  await next();
};

loan.transferList = async(ctx, next) => {
  const { userId, ipAddress, platform } = ctx.args;
  const data = {
    loanTransferId: ctx.checkBody('transferId').value - 0 || 0,
    loanId: ctx.checkBody('loanId').value - 0 || 0,
    userId,
    ipAddress,
    platform
  };
  let ret;
  let transferMethod;
  var method = {
    loanTransferId: 'transferOrderList',
    loanId: 'loanTransferRecord'
  };
  if (!data.loanTransferId && !data.loanId) {
    return;
  }
  transferMethod = data.loanTransferId ? method.loanTransferId : method.loanId;
  ret = JSON.parse(await ctx.proxy[transferMethod](data));
  if (!ret || ret.status !== 0) {
    return await next();
  }
  ctx.state.dataList = _.get(ret, 'data.dataList') || [];
  await next();
};

loan.transferConfirm = async(ctx, next) => {
  const { userId, platform, ipAddress } = ctx.args;
  const transferId = ctx
    .checkParams('id')
    .isInt()
    .toInt().value;
  const data = {
    userId,
    ipAddress,
    platform,
    version: '1.0',
    transferId: transferId,
    buyMoney: ctx.checkBody('amount').trim().value,
    riskType: ctx.checkBody('risktype').value
  };
  await Promise.all([
    ctx.proxy.transferConfirm(data),
    ctx.state.isLogin ? ctx.proxy.userAssets(data) : null,
    ctx.proxy.accountWithDrawUserCard(data)
  ]).then(
    function(value) {
      var _buyResult = JSON.parse(value[0]);
      if (_buyResult.status !== 0) {
        _.extend(ctx.state, {
          errorMessage: _.get(_buyResult, 'message') || [],
          errorCode: _.get(_buyResult, 'status') || []
        });
        return;
      }
      _.extend(ctx.state, {
        buyResult: _.get(_buyResult, 'data') || [],
        userAssets:
          (value[1] && _.get(JSON.parse(value[1]), 'data.point')) || '',
        userCard:
          (value[2] && _.get(JSON.parse(value[2]), 'data.userBank')) || ''
      });
    },
    function() {}
  );
  ctx.state.transferId = transferId;
  await next();
};

loan.transferBack = async(ctx, next) => {
  const _amount = ctx.checkBody('amount').trim().value;
  const _transferid = ctx.checkBody('transferid').trim().value;
  //const _userId = _.get(ctx.state, 'user.id', 0) - 0 || 0;

  ctx.state.productId = _transferid;
  ctx.state.amount = _amount;
  ctx.state.isTransfer = 1;
  // const _data = {
  //   userId: _userId,
  //   transferId: _transferid,
  //   buyAmount: _amount,
  //   ipAddress: ctx.ip,
  //   platform: 'PC'
  // };
  // await ctx.proxy.transferBuyResult(_data)
  //   .then(function(val) {
  //     ctx.state.transferId= _transferid;
  //     if(!val){
  //       _.extend(ctx.state, {
  //         errorMessage: _.get(ret, 'message') || [],
  //         errorCode: _.get(ret, 'status') || [],
  //         isTransfer: 1
  //       })
  //       return;
  //     }
  //     var ret = JSON.parse(val);
  //     if (ret.status !== 0) {
  //       ctx.state.isSuccess = 0;
  //       _.extend(ctx.state, {
  //         errorMessage: _.get(ret, 'message') || [],
  //         errorCode: _.get(ret, 'status') || [],
  //         isTransfer: 1
  //       });
  //       return;
  //     }
  //     ctx.state.isSuccess = 1;
  //     _.extend(ctx.session, {
  //       buyInfo: _.get(ret, 'data'),
  //       isTransfer: 1
  //     })
  //     ctx.redirect('/transfer/' + _transferid + '/success');
  //   }, function(err) {
  //   })
  await next();
};

loan.transferResult = async(ctx, next) => {
  var err = _.clone(AJAX_ERROR);
  const { userId, platform, ipAddress } = ctx.args;
  const transferId = ctx.checkBody('productId').trim().value;
  const buytype = ctx.checkBody('buyType').value || '';
  const data = {
    userId,
    ipAddress,
    platform,
    transferId: transferId,
    buyAmount: ctx.checkBody('amount').notEmpty(ErrMsg.isAmount).value,
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
    willingToBuy: ctx.checkBody('willingToBuy').value ? '1' : '0'
  };
  if (ctx.errors) {
    err.data = ctx.errors;
    ctx.body = err;
    return;
  }
  await ctx.proxy.transferBuyResult(data).then(
    function(val) {
      ctx.state.transferId = transferId;
      if (!val) {
        _.extend(ctx.state, {
          errorMessage: _.get(ret, 'message') || '',
          errorCode: _.get(ret, 'status') || '',
          isTransfer: 1
        });
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
      if (ret.status !== 0) {
        ctx.state.isSuccess = 0;
        _.extend(ctx.state, {
          errorMessage: _.get(ret, 'message') || '',
          errorCode: _.get(ret, 'status') || '',
          isTransfer: 1
        });
        return next();
      }
      ctx.state.isSuccess = 1;
      _.extend(ctx.state, {
        buyInfo: _.get(ret, 'data'),
        isTransfer: 1
      });
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

module.exports = loan;
