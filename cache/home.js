'use strict';
// home
var cache = require('memory-cache');

const { _ } = require('../lib/util');
const { redis } = require('../lib/db');
const conf = require('./conf');

const PLATFORM = {
  ios: 'iphone',
  android: 'android'
};
const DEFAULT_H5_HOST = 'https://m.hoomxb.com';
const DEFALUT_PLATFORM = PLATFORM['ios'];

// global
exports.get_global = async() => {
  var key = 'global';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.hgetall(key);
  return cache.put(key, data, conf.LONG);
};

// banner list
exports.get_banner_list = async() => {
  var key = 'banners';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  var list = _.sortBy(data.map(JSON.parse), function(item) {
    return item.order - 0;
  });
  return cache.put(key, list, conf.LONG);
};

// APP banner list
exports.get_app_banner_list = async() => {
  var key = 'app:banners';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  var list = _.sortBy(data.map(JSON.parse), function(item) {
    return item.order - 0;
  });
  return cache.put(key, list, conf.LONG);
};

// APP banner list
exports.get_app_popups_list = async() => {
  var key = 'app:popups';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  var list = data.map(JSON.parse);
  return cache.put(key, list, conf.LONG);
};

// APP banner list
exports.get_app_popups_list = async() => {
  var key = 'app:popups';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  var list = data.map(JSON.parse);
  return cache.put(key, list, conf.LONG);
};

// announce list
exports.get_announce_list = async() => {
  var key = 'announce';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  return cache.put(key, data.map(JSON.parse), conf.LONG);
};

// app global
exports.get_app_global = async() => {
  var key = 'app:global';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.hgetall(key);
  return cache.put(key, data, conf.LONG);
};

// app info
exports.get_app_info = async(platform = 'ios') => {
  const key = (platform && PLATFORM[platform]) || DEFALUT_PLATFORM;
  const cacheKey = `app:${key}:info`;
  let data = cache.get(cacheKey);
  let ret;

  if (data) {
    return data;
  }

  try {
    ret = await exports.get_app_global();
  } catch (error) {
    ret = {};
  }

  const name = _.get(ret, `${key}AppName`, '');
  const url = _.get(ret, `${key}DownloadUrl`, '');
  const host = _.get(ret, 'h5host', DEFAULT_H5_HOST);
  return cache.put(
    cacheKey,
    {
      appname: name,
      h5host: host,
      url
    },
    conf.LONG
  );
};

// versionList
exports.get_app_version_list = async(platform = 'ios') => {
  const key = (platform && PLATFORM[platform]) || DEFALUT_PLATFORM;
  const LIST_KEY = `${key}VersionList`;

  let ret;
  try {
    ret = await exports.get_app_global();
  } catch (error) {
    ret = {};
  }

  const ListStr = ret && _.get(ret, LIST_KEY);
  if (!ret || !ListStr) {
    return [];
  }
  return JSON.parse(ListStr) || [];
};

// lastest version
exports.get_app_lastest_version = async(platform = 'ios') => {
  const key = (platform && PLATFORM[platform]) || DEFALUT_PLATFORM;
  const cacheKey = `app:${key}:lastest:version`;
  let data = cache.get(cacheKey);

  if (data) {
    return data;
  }
  const list = await exports.get_app_version_list(key);
  data =
    list &&
    list.length &&
    list.find(ele => {
      return !ele.disabled;
    });

  data && cache.put(cacheKey, data, conf.LONG);
  return data;
};

//app announce_list
exports.get_app_announce_list = async() => {
  var key = 'app:announces';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  return cache.put(key, data.map(JSON.parse), conf.LONG);
};

// app global
exports.get_app_raiseList = async() => {
  var key = 'app:raise';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.lrange(key, 0, -1);
  return cache.put(key, data.map(JSON.parse), conf.LONG);
};

// h5 miya userCount
exports.get_miya_userCount = async() => {
  var key = 'activity';
  var data = cache.get(key);
  if (data) {
    return data;
  }
  data = await redis.hgetall(key);
  return cache.put(key, data, conf.LONG);
};
