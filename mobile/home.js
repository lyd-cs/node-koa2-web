'use strict';

const home = async(ctx, next) => {
  ctx.redirect('https://www.hoomxb.com');
  await next();
};

module.exports = home;
