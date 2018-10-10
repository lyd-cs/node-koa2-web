'use strict';

/**
 * invite
 **/
const { _ } = require('../lib/util');

const ErrorStatus = require('../lib/status');
//const ErrorMessage = require('../lib/errormsg');

const InviteModel = require('../model/invite');

// default
const invite = async(ctx, next) => {
  await next();
};

// 我的邀请列表
invite.query = async(ctx) => {
  const service = ctx.service.invite;

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
    // 邀请记录
    // http://doc.hoomxb.com/index.php?s=/1&page_id=408
    values = await service.query(query, 'account/list');
    ret = {
      pageSize,
      pageNumber,
      totalCount: 0,
      ...values,
      dataList: _.get(values, 'dataList', []).map(InviteModel),
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 我的邀请统计信息
invite.overview = async(ctx) => {
  const service = ctx.service.invite;

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
    // 统计信息
    // http://doc.hoomxb.com/index.php?s=/1&page_id=380
    values = await service.fetch(query, 'overview');
    ret = {
      cashBackAmount: '0',
      couponNumber: 0,
      inviteNumber: 0,
      ...values,
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = invite;