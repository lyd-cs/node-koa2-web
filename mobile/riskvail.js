'use strict';

const ErrorStatus = require('../lib/status');

const riskvail = async(ctx, next) => {
  await next();
};

riskvail.evaluate = async ctx => {
  const service = ctx.service.account;

  const { userId, ipAddress, platform } = ctx.args;

  const score =
    ctx
      .checkBody('score')
      .notEmpty()
      .trim().value || 0;
  const option = ctx.checkBody('scoreDetail').value || '';
  const query = {
    score,
    option,
    userId,
    ipAddress,
    platform
  };

  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.FAIL);
    return;
  }

  try {
    await service.update(query, 'risk');
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON();
};

riskvail.home = async(ctx, next) => {
  const { sessionId } = ctx;
  ctx.state.userToken = sessionId;
  await next();
};

module.exports = riskvail;
