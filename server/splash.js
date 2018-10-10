'use strict';

/**
 * splash
 */
const {
  _,
  parseUserAgent,
  versionCompare,
  permissionFilter
} = require('../lib/util');

const UserModel = require('../model/user');
const SplashModel = require('../model/splash');
const ShareStatusModel = require('../model/shareStatus');

const DEVICE_ANDROID = 'android';
const DEVICE_IOS = 'ios';
const DEVICE_IPHONE_X = 'iphoneX';

const splash = async ctx => {
  const splashCache = ctx.cache.splash;
  const homeCache = ctx.cache.home;

  const { isLogin, userAgent } = ctx.args;

  const { isIPhoneX, isAndroid, isIOS, version } = parseUserAgent(userAgent);
  const platform = isAndroid ? 'android' : 'ios';

  // permission filter
  const { isSales, promotion } = UserModel(ctx.state.userState);
  const permissionFilterOption = {
    isLogin,
    isSales,
    promotion,
    platform: isAndroid ? 'android' : isIOS ? 'ios' : 'UNKNOW'
  };

  let ret = { image: '' };
  let action = DEVICE_IOS;

  if (isIPhoneX) {
    action = DEVICE_IPHONE_X;
  } else if (isAndroid) {
    action = DEVICE_ANDROID;
  } else if (isIOS) {
    action = DEVICE_IOS;
  }

  try {
    const values = await Promise.all([
      homeCache.get_app_lastest_version(platform),
      homeCache.get_app_info(platform),
      splashCache.query(action)
    ]);
    const { version: lastestVersion } = _.get(values, '[0]', {});
    const { h5host } = _.get(values, '[1]', []);
    const list = _.get(values, '[2]', []);
    let outOfBounds;

    if (version && lastestVersion) {
      outOfBounds = versionCompare(version, lastestVersion) > 0;
    }

    const item = list
      .filter(permissionFilter(permissionFilterOption))
      .find(SplashModel.availableSplash(outOfBounds));

    ret = ShareStatusModel(SplashModel(item || ret, { host: h5host }));
  } catch (error) {
    // do nothing
  }
  //let id = ~~(Math.random() * 10);
  //url = `https://picsum.photos/720/1280/?image=${id}`;
  ctx.dumpJSON(ret);
};

module.exports = splash;
