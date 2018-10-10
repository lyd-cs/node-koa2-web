'use strict';

const ErrMsg = require('../lib/errormsg');
const {
  safeRealname,
  availableRaise,
  _,
  INCOME_TREATMENT,
  parseUserAgent
} = require('../lib/util');

const landing = async next => {
  await next();
};

landing.shareQrcode = async(ctx, next) => {
  const service = ctx.service;
  let staffId, query, ret;
  const {
    ipAddress,
    platform
  } = ctx.args;

  if (ctx.method === 'POST') {
    staffId = ctx.checkBody('staffId').value || '';
    query = {
      investCode: staffId,
      ipAddress,
      platform
    };
    if (ctx.errors) {
      return await next();
    }
    try {
      ret = await service.account.fetch(query, 'vertifyInviteCode');
    } catch (error) {
      ctx.addError('invite', ErrMsg.isStaffId);
      return await next();
    }
    if (!ret) {
      ctx.addError('invite', ErrMsg.def);
      return await next();
    }
    ctx.state.staffId = staffId;
    ctx.redirect('/landing/invite/' + staffId);
  }
  await next();
};
landing.inviteShare = async(ctx, next) => {
  const service = ctx.service;
  const staffId = ctx.checkParams('id').value || '';
  const {
    ipAddress,
    platform
  } = ctx.args;
  let query = {
    investCode: staffId,
    ipAddress,
    platform
  };
  let ret;
  try {
    ret = await service.account.fetch(query, 'vertifyInviteCode');
  } catch (error) {
    ctx.redirect('/landing/invite');
    return;
  }
  if (!ret) {
    ctx.redirect('/landing/invite');
    return;
  }
  ctx.state.staffId = staffId;

  await next();
};
landing.about = async(ctx, next) => {
  //const service = ctx.service;
  let staffId = ctx.checkParams('id').isInt().value || 0;
  if (ctx.errors) {
    staffId = 0;
  }
  const {
    utmSource
  } = ctx.args;
  // let query = {
  //   investCode: staffId,
  //   ipAddress,
  //   platform
  // };
  // let ret;
  // try{
  //   ret = await service.account.fetch(query, 'vertifyInviteCode');
  // }catch(error){
  //   ctx.redirect('/landing/invite');
  //   return;
  // }
  // if (!ret) {
  //   ctx.redirect('/landing/invite');
  //   return;
  // }

  Object.assign(ctx.state, {
    staffId,
    utmSource
  });
  await next();
};

landing.inviteRegister = async(ctx, next) => {
  const userId = ctx.checkParams('id').value - 0 || 0;
  let inviteSerial, realName;
  try {
    await ctx.cache.user.get_state(userId).then(function(value) {
      if (!value) {
        ctx.addError('register', ErrMsg.def);
        return;
      }
      ({
        inviteSerial,
        realName
      } = value);
    });
  } catch (err) {
    inviteSerial = '';
    realName = '';
  }

  Object.assign(ctx.state, {
    userId: userId,
    inviteSerial: inviteSerial || '',
    inviteRealname: realName ? safeRealname(realName) : '',
    utmSource: ctx.checkQuery('utmSource').value || ''
  });
  await next();
};

landing.carnival = async(ctx, next) => {
  let utmSource = ctx.checkQuery('utmSource').value || '';
  let interimReview = !ctx.checkParams('action').value;
  Object.assign(ctx.state, {
    utmSource,
    interimReview
  });
  await next();
};

landing.registerShare = async(ctx, next) => {
  let {
    utmSource
  } = ctx.args;
  Object.assign(ctx.state, {
    utmSource
  });
  await next();
};

landing.highPoint = async(ctx, next) => {
  let list = await ctx.cache.home.get_app_raiseList();
  let item = _.find(list, availableRaise);
  ctx.state.raiseList = item;
  await next();
};
landing.investedGift = async(ctx, next) => {
  const servicePlan = ctx.service.plan;
  const serviceAccount = ctx.service.account;

  //- 是否是京东卡活动
  let isJdActive;
  const {
    userId,
    isLogin,
    platform,
    ipAddress
  } = ctx.args;
  const userInfo = (await ctx.cache.user.get_state(userId)) || {};
  const {
    promotion = ''
  } = userInfo;
  const isPromotion = promotion.indexOf('Group3') !== -1;
  const isPromotionGroup6 = promotion.indexOf('Group6') !== -1;
  if (isPromotion || isPromotionGroup6) {
    isJdActive = 1;
  }
  const query = {
    platform,
    ipAddress,
    isActivice: isJdActive,
    cashType: INCOME_TREATMENT.INVEST
  };
  const jdCardQuery = {
    userId,
    platform,
    ipAddress
  };
  let values;
  if (!isLogin) {
    return await next();
  }

  try {
    values = await Promise.all([
      servicePlan.query(query, 'planlist/recommend'),
      serviceAccount.query(jdCardQuery, 'account/jdCards')
    ]);

    Object.assign(ctx.state, {
      recommendList: _.get(values[0], 'dataList', []),
      jdCards: _.get(values[1], 'userCards', {})
    });
  } catch (error) {
    ctx.addError('page', error.message || ErrMsg.def);
    ctx.state.errors = ctx.errors;
  }

  await next();
};

landing.registerJdCard = async(ctx, next) => {
  const service = ctx.service.plan;

  const defaultList = [{
      lockPeriod: 1,
      expectedRate: '5.8'
    },
    {
      lockPeriod: 3,
      expectedRate: '6.5'
    },
    {
      lockPeriod: 6,
      expectedRate: '7.5'
    },
    {
      lockPeriod: 12,
      expectedRate: '9.6'
    }
  ];
  const utmSource = ctx.checkQuery('utmSource').value || '';
  const {
    ipAddress,
    platform
  } = ctx.args;
  const query = {
    cashType: INCOME_TREATMENT.INVEST,
    isActivice: 1,
    ipAddress,
    platform
  };
  let ret;
  let recommendPlanList;
  try {
    ret = await service.query(query, 'home/recommend');
    ({
      dataList: recommendPlanList = defaultList
    } = ret);
  } catch (error) {
    recommendPlanList = defaultList;
  }

  Object.assign(ctx.state, {
    recommendPlanList,
    utmSource
  });
  await next();
};

landing.miya = async(ctx, next) => {
  const service = ctx.service.plan;
  const serviceLanding = ctx.service.landing;
  const {
    userId,
    ipAddress,
    platform,
    utmSource,
    userAgent
  } = ctx.args;
  const query = {
    userId,
    ipAddress,
    platform,
    isActivice: '2',
    cashType: INCOME_TREATMENT.INVEST
  };
  const {
    isIOS,
    isAndroid
  } = parseUserAgent(userAgent);
  const platformFilter = isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW';
  let planList;
  let novicePlanList;
  let turntablePlanList;
  let values;
  let planType = 'RED_PLAN';
  try {
    if (!ctx.state.isLogin || utmSource) {
      planList = [{
          id: '1',
          lockPeriod: '1',
          baseInterestRate: '5.8',
          extraInterestRate: '1.0'
        },
        {
          id: '3',
          lockPeriod: '3',
          baseInterestRate: '6.5',
          extraInterestRate: ''
        },
        {
          id: '9',
          lockPeriod: '9',
          baseInterestRate: '9.6',
          extraInterestRate: '1.0'
        }
      ];
      Object.assign(ctx.state, {
        utmSource,
        planList
      });
      return await next();
    }

    values = await Promise.all([
      service.query(query, 'home/recommend'),
      serviceLanding.query(query, 'miya/turntable/planList')
    ]);
    planList = values && _.get(values, '[0].dataList') || [];
    novicePlanList = values && _.get(values, '[1].dataList') || [];

    if (platformFilter === 'android') {
      planType = 'NEW_PLAN';
      turntablePlanList = novicePlanList.filter(function(item,index){ return index===0;});
    }
  } catch (error) {
    ctx.addError('page', error.message || ErrMsg.def);
    ctx.state.errors = ctx.errors;
  }
  Object.assign(ctx.state, {
    utmSource,
    planList,
    planType,
    turntablePlanList
  });
  await next();
};
landing.noviceArea = async(ctx, next) => {
  const service = ctx.service.plan;

  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  let query = {
    userId,
    ipAddress,
    platform
  };

  let values;
  try {
    values = await service.query(query, 'plan/newbieProduct');
    ctx.state.noviceProduct = _.get(values, 'dataList[0]');
  } catch(error) {
    await next();
    return;
  }
  await next();
};

landing.duanwu = async(ctx, next) => {
  const service = ctx.service.landing;
  const {
    userId,
    platform,
    ipAddress,
    pageNumber,
  } = ctx.args;
  const query = {
    userId,
    platform,
    ipAddress,
    pageNumber,
    pageSize: 10,
  };
  let values, investAmount, investList, planIdList, planIdItem;

  try {
    values = await Promise.all([
      service.query(query, 'duanwu/ranking/list'),
      ctx.cache.home.get_app_raiseList(),
    ]);
    investAmount = values && _.get(values[0], 'myInvestAmount', 0) - 0;
    investList = values && _.get(values[0], 'dataList', []) || [];

    planIdList = values && _.get(values, '[1]', []);
    planIdItem = _.find(planIdList, availableRaise);
  } catch (error) {
    investAmount = 0;
    investList = [];
    planIdItem = [];
  }
  Object.assign(ctx.state, {
    investAmount,
    investList,
    raiseList: planIdItem,
  });
  await next();
};

landing.miyaTurntable = async(ctx, next) => {
  const service = ctx.service.landing;
  const {
    ipAddress,
    userAgent,
    utmSource,
    platform
  } = ctx.args;
  const query = {
    ipAddress,
    platform
  };
  const {
    isIOS,
    isAndroid
  } = parseUserAgent(userAgent);
  const platformFilter = isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW';
  let planType = 'RED_PLAN';
  let values;
  let turntablePlanList;
  let userCount = 0;
  let defaultPlanList = [{
          id: '1',
          lockPeriod: '1',
          baseInterestRate: '5.8',
          extraInterestRate: '1.0'
        },
        {
          id: '9',
          lockPeriod: '9',
          baseInterestRate: '9.6',
          extraInterestRate: '1.0'
        }
      ];
  try{

    values = await Promise.all([
      service.query(query, 'miya/turntable/planList'),
      ctx.cache.home.get_miya_userCount()
    ]);

    let dataList = values && _.get(values, '[0].dataList');
    userCount = values && _.get(values, '[1].userCount') || 0;

    if (platformFilter === 'android') {
      planType = 'NEW_PLAN';
      turntablePlanList = dataList.filter(function(item,index){ return index===0;});
    } else {
      turntablePlanList = dataList.filter(function(item,index){ return index>0;});
    }
  }catch(error){
    turntablePlanList = defaultPlanList;
  }

  Object.assign(ctx.state, {
    turntablePlanList,
    userCount,
    utmSource,
    planType
  });
  await next();
};

module.exports = landing;
