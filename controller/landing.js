const util = require('../lib/util');

const {
  availableRaise,
  _,
} = util;


const landing = async(ctx, next) => {
  await next();
};

landing.duanwu = async(ctx, next) => {
  const service = ctx.service.landing;
  const {
    userId,
    ipAddress,
    platform,
    pageNumber
  } = ctx.args;
  const query = {
    userId,
    ipAddress,
    platform,
    pageSize: 10,
    pageNumber
  };

  let values;
  let planIdList;
  let planIdItem;
  let rankList;
  let totalInvest;
  try {
    values = await Promise.all([
      ctx.cache.home.get_app_raiseList(),
      service.query(query, 'duanwu/ranking/list'),
    ]);
    planIdList = values && _.get(values, '[0]') || [];
    planIdItem = _.find(planIdList, availableRaise);
    rankList = values && _.get(values, '[1].dataList');
    totalInvest = values && _.get(values, '[1].myInvestAmount');
    Object.assign(ctx.state, {
      raiseList: planIdItem,
      rankList,
      totalInvest
    });
  } catch (error) {
    Object.assign(ctx.state, {
      raiseList: [],
      rankList: [],
      totalInvest: 0
    });
  }
  await next();
};

module.exports = landing;