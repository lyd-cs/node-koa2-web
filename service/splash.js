'use strict';
/**
 * splash
 **/
const { redis } = require('../lib/db');
const {
  _,
  uuid
} = require('../lib/util.js');

const KEYS = {
  'android': 'app:android:splash',
  'ios': 'app:iphone:splash',
  'iphoneX': 'app:iphoneX:splash'
};
const DEFALUT_KEY = KEYS['ios'];

module.exports = {
  create(values, action = 'android') {
    const KEY = (action && KEYS[action]) || DEFALUT_KEY;
    const now = Date.now();

    Object.assign(values, {
      id: uuid(),
      createTime: now,
      updateTime: now
    });

    return redis.lpush(KEY, JSON.stringify(values));
  },

  async update(values, action = 'android') {
    const KEY = (action && KEYS[action]) || DEFALUT_KEY;
    const now = Date.now();

    function isMatch(item) {
      return item.id == values.id;
    }

    Object.assign(values, {
      updateTime: now
    });
    const res = await redis.lrange(KEY, 0, -1);
    const ret = res.map(JSON.parse);
    const idx = ret && ret.findIndex(isMatch);
    if (idx < 0) {
      throw new Error(404);
    }
    return redis.lset(KEY, idx, JSON.stringify(values));
  },

  async remove(id, action = 'android') {
    const KEY = (action && KEYS[action]) || DEFALUT_KEY;
    const ret = await module.exports.fetch(id, action);
    if (!ret) {
      throw new Error(404);
    }

    return redis.lrem(KEY, 0, JSON.stringify(ret));
  },

  async fetch(id, action = 'android') {
    const KEY = (action && KEYS[action]) || DEFALUT_KEY;

    function isMatch(item) {
      return item.id == id;
    }
    const res = await redis.lrange(KEY, 0, -1);
    const ret = res.map(JSON.parse);

    if (id && ret.length) {
      return ret.find(isMatch);
    }
    return _.sortBy(ret, ['order']);
  }
};