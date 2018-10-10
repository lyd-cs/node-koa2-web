'use strict';

/**
 * user
 */
var db = require('../lib/db');
var redis = db.redis;

exports.get_state = async(id) => {
  if (!id) {
    return null;
  }
  var key = 'u:' + id;
  var data = await redis.hgetall(key);
  return data;
};