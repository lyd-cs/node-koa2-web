'use strict';

const util = require('../lib/util');
const ErrorStatus = require('../lib/status');
const PlanModel = require('../model/plan');
const UserModel = require('../model/user');
const ShareStatusModel = require('../model/shareStatus');

const {
  _,
  log4js,
  formatURL,
  parseUserAgent,
  availableTimeFilter,
  permissionFilter
} = util;

const logger = log4js.getLogger('API:home');

function BannerModel(model = {}, extra = {}) {
  const { host } = extra;
  if (model.image) {
    model.image = formatURL(model.image, host);
  }
  // 默认h5页面
  if (!model.type) {
    model.type = 'h5';
  }
  if (!model.link) {
    model.link = model.url;
  }
  if (model.type !== 'h5') {
    model.url = '';
  }
  return ShareStatusModel(model, extra);
}

function PopupsModel(model = {}, extra = {}) {
  const { host } = extra;
  if (model.image) {
    model.image = formatURL(model.image, host);
  }
  // 默认h5页面
  if (!model.type) {
    model.type = 'h5';
  }
  if (!model.link) {
    model.link = model.url;
  }
  return ShareStatusModel(model, extra);
}

function PlatformIntroductionModel(model = [], extra = {}) {
  const { host } = extra;
  return model.map(item => {
    if (item.image) {
      item.image = formatURL(item.image, host);
    }
    // 默认h5页面
    if (!item.type) {
      item.type = 'h5';
    }
    if (item.type === 'h5') {
      item.url = formatURL(item.url, host);
    }
    return item;
  });
}

const home = async ctx => {
  const service = ctx.service;
  const cache = ctx.cache.home;

  const {
    userId,
    ipAddress,
    platform,
    isNewbie,
    isLogin,
    userAgent
  } = ctx.args;

  const query = {
    userId,
    ipAddress,
    platform
  };

  const homePlatformIntroduction = [
    {
      title: '信息披露',
      url: '/about/company',
      image: '/img/app-information-disclosure.png',
      type: 'h5'
    },
    {
      title: '平台数据',
      url: '/about/platform',
      image: '/img/app-platform-data.png',
      type: 'h5'
    }
  ];

  const NEWBIE_PRODUCT_VERSION = 'newbie'; //2.5.0版本（新手产品、推荐位包含按月提取收益）
  const MONTHLY_PRODUCT_VERSION = 'all'; //2.4.0版本（推荐位包含按月提取收益）
  const REDELIVERY_PRODUCT_VERSION = 'invest'; //2.4.0之前版本（推荐位不包含按月提取收益）
  const NEWBIE_MONTHLY_redelivery_PRODUCT = 'home/newbieVersionRecommend';

  // 不同版本接口action
  const actionMap = {
    [NEWBIE_PRODUCT_VERSION]: 'plan/newbieProduct',
    [MONTHLY_PRODUCT_VERSION]: 'home/all',
    [REDELIVERY_PRODUCT_VERSION]: 'home/featured'
  };

  // permission filter
  const { isSales, promotion } = UserModel(ctx.state.userState);
  const { isIOS, isAndroid } = parseUserAgent(userAgent);
  const permissionFilterOption = {
    isLogin,
    isSales,
    promotion,
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW'
  };

  let cashType = (ctx.checkQuery('cashType').value || '').toLowerCase(),
    shouldDisplayNewbieProduct,
    recommendAction,
    newbieAction,
    values,
    ret;
  // 根据cashType值区分不同版本home接口具有的功能
  const versionMap = {
    [NEWBIE_PRODUCT_VERSION](cashType) {
      shouldDisplayNewbieProduct = isNewbie || !isLogin;
      recommendAction = NEWBIE_MONTHLY_redelivery_PRODUCT;
      newbieAction = actionMap[cashType];
    },
    [MONTHLY_PRODUCT_VERSION](cashType) {
      recommendAction = actionMap[cashType];
    },
    def() {
      recommendAction = actionMap[REDELIVERY_PRODUCT_VERSION];
    }
  };

  versionMap[cashType] ? versionMap[cashType](cashType) : versionMap.def();

  try {
    values = await Promise.all([
      cache.get_app_banner_list(),
      service.plan.query(query, recommendAction),
      cache.get_app_global(),
      shouldDisplayNewbieProduct
        ? service.plan.query(query, newbieAction)
        : null
    ]);
    const appGlobalData = _.get(values, '[2]', []);
    const { planTitle, baseTitle, h5host } = appGlobalData;
    ret = {
      bannerList: _
        .get(values, '[0]', [])
        .filter(availableTimeFilter)
        .filter(permissionFilter(permissionFilterOption))
        .map(BannerModel, {
          host: h5host
        }),
      homePlanRecommend: _.get(values, '[1].dataList', []).map(PlanModel, {
        host: h5host
      }),
      homeTitle: { planTitle, baseTitle },
      homePlatformIntroduction: PlatformIntroductionModel(
        homePlatformIntroduction,
        { host: h5host }
      )
    };
    if (shouldDisplayNewbieProduct) {
      const dataList = _.get(values, '[3].dataList', []).map(PlanModel);
      // 2.8版本新添加新手产品图片地址
      const { h5host } = _.get(values, '[2]', {});
      const newbieProductData = {
        dataList,
        maxRate: _.get(
          _.maxBy(dataList, 'totalExpectedRate'),
          'totalExpectedRate',
          0
        ),
        img: formatURL('/img/newbie.product.png', h5host),
        url: formatURL('/landing/novice', h5host)
      }; // 新手推荐位最高利率, 基准利率+贴息利率
      Object.assign(ret, { newbieProductData });
    }
  } catch (error) {
    logger.error('home.Promise.all.error', error);
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

home.announceList = async ctx => {
  const cache = ctx.cache.home;

  const { pageSize, pageNumber } = ctx.args;
  const start = (pageNumber - 1) * pageSize;
  const end = pageNumber * pageSize;

  let value;
  let ret;

  try {
    value = await cache.get_app_announce_list();
    const totalCount = value.length;
    ret = {
      dataList: value.slice(start, end).map(x => _.omit(x, 'content')),
      totalCount,
      pageSize,
      pageNumber
    };
  } catch (error) {
    logger.error('appAnnounceList', error);
    ctx.dumpJSON(ErrorStatus.FAIL, error);
    return;
  }

  ctx.dumpJSON(ret);
};

// home popups
home.popups = async ctx => {
  const cache = ctx.cache.home;
  const { isLogin, userAgent } = ctx.args;

  // permission filter
  const { isSales, promotion } = UserModel(ctx.state.userState);
  const { isIOS, isAndroid } = parseUserAgent(userAgent);
  const permissionFilterOption = {
    isLogin,
    isSales,
    promotion,
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW'
  };

  let ret;

  try {
    let values = await Promise.all([
      cache.get_app_popups_list(),
      cache.get_app_info()
    ]);
    const { h5host } = _.get(values, '[1]', {});
    ret = _
      .get(values, '[0]', [])
      .filter(permissionFilter(permissionFilterOption))
      .find(availableTimeFilter);
    ret = ret && PopupsModel(ret, { host: h5host });
  } catch (error) {
    logger.error('appAnnounceList', error);
    ctx.dumpJSON(ErrorStatus.FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

module.exports = home;
