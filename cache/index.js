'use strict';
// cache
var cache = require('memory-cache');

exports.home = require('./home');
exports.user = require('./user');
exports.splash = require('./splash');
exports.bank = require('./bank');

// cache debug
//cache.debug(conf.debug || false);

Object.keys(cache).forEach( function(key) {
  exports[key] = cache[key];
});
