'use strict';

const ErrMsg = require('../lib/errormsg');

const enterprise = async(ctx, next) => {
  await next();
};

enterprise.recharge = async(ctx, next) => {
  const service = ctx.service.enterprise;

  const query = {
    amt: ctx.checkBody('amount').trim().value,
    returnUrl: ctx.origin + '/enterprise/recharge/result/baofu'
  };

  let ret;
  try {
    ret = await service.update(query, 'recharge');
    ctx.state.rechargeData = ret;
  } catch (error) {
    ctx.addError('result', error._message || ErrMsg.def);
    ctx.state.tpl = 'enterprise.pug';
  }
  await next();
};

enterprise.rechargeResultBaofu = async(ctx, next) => {
  const service = ctx.service.enterprise;

  const result = ctx.checkQuery('Result').value;
  const query = {
    resultDesc: ctx.checkQuery('ResultDesc').value
  };

  if (result == '1') {
    ctx.state.isResult = 1;
    ctx.state.orderAmount = ctx.checkQuery('FactMoney').value;
    return await next();
  }
  let ret;
  try {
    ret = await service.update(query, 'recharge/result/baofu');
    ctx.state.errorMessage = ret.resultDesc;
  } catch (error) {
    ctx.throw(error);
    return;
  }

  await next();
};

module.exports = enterprise;
