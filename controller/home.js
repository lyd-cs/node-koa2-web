'use strict';

const UserModel = require('../model/user');

const {
  _,
  log4js,
  INCOME_TREATMENT,
  parseUserAgent,
  availableTimeFilter,
  permissionFilter
} = require('../lib/util');

const logger = log4js.getLogger('cache:home');

const home = async(ctx, next) => {
  const service = ctx.service.plan;
  const isSignupSuccess = _.get(ctx.session, 'signupSuccess', 0) || 0;
  const { isLogin, platform, userId, userAgent, ipAddress } = ctx.args;

  if (isLogin && isSignupSuccess) {
    delete ctx.session.signupSuccess;
    ctx.state.isSignupSuccess = isSignupSuccess;
  }

  // permission filter
  const { isSales, promotion } = UserModel(ctx.state.userState);
  const { isIOS, isAndroid } = parseUserAgent(userAgent);
  const permissionFilterOption = {
    isLogin,
    isSales,
    promotion,
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW'
  };

  const query = {
    version: '1.0',
    ipAddress,
    userId,
    platform
  };

  await Promise.all([
    ctx.cache.home.get_banner_list(),
    ctx.proxy.planListRecommend({
      ...query,
      cashType: INCOME_TREATMENT.INVEST
    }),
    ctx.proxy.planListRecommend({
      ...query,
      cashType: INCOME_TREATMENT.CASH
    }),
    ctx.proxy.loanList({
      ...query,
      pageSize: 5
    }),
    ctx.cache.home.get_announce_list(),
    ctx.session.isLogin ? ctx.proxy.getUserEarn(query) : null,
    service.query(query, 'novice')
  ]).then(
    function(values) {
      _.assign(ctx.state, {
        bannerList: values[0]
          .filter(availableTimeFilter)
          .filter(permissionFilter(permissionFilterOption)),
        homePlanRecommend:
          (values[1] && _.get(JSON.parse(values[1]), 'data.dataList')) || [],
        monthlyPaymentsRecommend:
          (values[2] && _.get(JSON.parse(values[2]), 'data.dataList')) || [],
        homeGuideYearRate:
          values[1] && _.get(JSON.parse(values[1]), 'data.expectedRateUplan'),
        homeLoanList:
          (values[3] && _.get(JSON.parse(values[3]), 'data.dataList')) || [],
        homeAnnounce: (values[4] && _.get(values[4], '[0]')) || [],
        userEarns: values[5] && _.get(JSON.parse(values[5]), 'data'),
        homeFeatureNovice: _.get(values, '[6].dataList[0]')
      });
    },
    function(error) {
      logger.error('home.Promise.all.error', error);
    }
  );
  await next();
};

module.exports = home;
