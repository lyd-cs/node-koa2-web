'use strict';
/**
 * toke
 */

const token = async(ctx) => {
  // save anything in seesion for saving in redis
  ctx.session.tokenStartTime = Date.now();
  ctx.body = {
    data: {
      'token': ctx.sessionId
    },
    status: 0,
    code: 0,
    message: 'success'
  };
};

module.exports = token;