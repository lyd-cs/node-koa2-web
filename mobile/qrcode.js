'use strict';

const qr = require('qr-image');

module.exports = async(ctx) => {
  var action = ctx.checkParams('action').value;
  var id = ctx.checkParams('id').value - 0;
  var url = ctx.origin;
  var text;

  var dict = {
    'invite': `/landing/about/${id}?utmSource=Group4-SalesH5`
  };
  // set default action
  if (!action || !dict[action]) {
    action = 'invite';
  }
  text = url + dict[action];
  ctx.type = 'image/png';
  ctx.body = qr.image(text, {
    margin: 1
  });
};
