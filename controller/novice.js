'use strict';

const{
  _
} = require('../lib/util');

const novice = async(ctx, next) => {
  const service = ctx.service.plan;
  const {
    platform,
    ipAddress,
  } = ctx.args;
  const query = {
    platform,
    ipAddress,
  };
  try{
    const value = await service.query(query, 'novice');
    ctx.state.noviceData = _.get(value, 'dataList[0]');
  }catch(error){
    //throw error;
    return await next();
  }

  await next();
};
module.exports = novice;

