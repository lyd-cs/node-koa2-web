'use strict';

/**
 * splash
 */
const cache = require('memory-cache');

const { _ } = require('../lib/util');
const { redis } = require('../lib/db');

const { LONG } = require('./conf');

const KEYS = {
  'android': 'app:android:splash',
  'ios': 'app:iphone:splash',
  'iphoneX': 'app:iphoneX:splash'
};
const DEFALUT_KEY = KEYS['ios'];

module.exports = {
  async query(action = 'android') {
    const key = (action && KEYS[action]) || DEFALUT_KEY;
    const data = cache.get(key);
    if (data) {
      return data;
    }
    const res = await redis.lrange(key, 0, -1);
    const ret = res.map(JSON.parse);

    return cache.put(key, _.sortBy(ret, ['order']), LONG);
  }
};