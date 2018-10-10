'use strict';

const ErrMsg = require('../lib/errormsg');
const {
  log4js,
  parseUserAgent,
  versionCompare
} = require('../lib/util');


const logger = log4js.getLogger('API:update');

/**
 * app upgrade level
 */
const NO_UPGRADE = 0;
const FORCE_UPGRADE = 1;
const OPTIONAL_UPGRADE = 2;

exports.appUpdate = async(ctx) => {
  const service = ctx.cache.home;

  const { userAgent } = ctx.args;
  const {
    isAndroid
  } = parseUserAgent(userAgent);

  const currentVersion = ctx.checkBody('versionCode').notEmpty(ErrMsg.isEmptyVersion).trim().value;
  const platform = isAndroid ? 'android' : 'ios';

  let updateData;
  let versionList;

  if (ctx.errors) {
    ctx.dumpJSON(403, 'params required');
    return;
  }

  try {
    //get redis app:global
    updateData = await service.get_app_info(platform);
    versionList = await service.get_app_version_list(platform);
  } catch (error) {
    logger.error('%s_app_info error: %s ', platform, JSON.stringify(error));
    return;
  }

  // 没有版本，没有配置，没有版本列表,不升级
  if (!currentVersion || !userAgent || !updateData || !versionList) {
    ctx.dumpJSON({
      ...updateData,
      force: NO_UPGRADE,
      versionCode: currentVersion,
      updateinfo: ''
    });
    return;
  }
  // {version:'2.1.1', force: 0|1|2, notice:'更新内容', disabled: true|false 禁用}
  // 最新，必选版本或可选版本
  const lastest = versionList && versionList.length && versionList.find((ele) => {
    return (!ele.disabled) && (ele.force == FORCE_UPGRADE || ele.force == OPTIONAL_UPGRADE);
  });
  // 最小的必选版本
  const lowest = versionList && versionList.length && versionList.find((ele) => {
    return (!ele.disabled) && (ele.force == FORCE_UPGRADE);
  });
  // 当前版本
  const current = versionList && versionList.length && versionList.find((ele) => {
    return ele.version == currentVersion;
  });

  // 如有最必选版本,且最小版本大，强制升级到最小版本
  if (lowest && versionCompare(lowest.version, currentVersion) > 0) {
    ctx.dumpJSON({
      ...updateData,
      force: FORCE_UPGRADE,
      versionCode: lowest.version,
      updateinfo: lowest.notice
    });
    return;
  }
  // 当前版本 > 最小必选 && 当前禁用 直接强制最新版本
  if (lastest && current && current.disabled) {
    ctx.dumpJSON({
      ...updateData,
      force: FORCE_UPGRADE,
      versionCode: lastest.version,
      updateinfo: lastest.notice
    });
    return;
  }
  // 当前版本 小于最新
  if (lastest && versionCompare(lastest.version, currentVersion) > 0) {
    ctx.dumpJSON({
      ...updateData,
      force: lastest.force,
      versionCode: lastest.version,
      updateinfo: lastest.notice
    });
    return;
  }
  // 所有情况都不符合，不升级
  ctx.dumpJSON({
    ...updateData,
    force: NO_UPGRADE,
    versionCode: currentVersion,
    updateinfo: ''
  });
};