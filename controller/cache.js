'use strict';

exports = module.exports = async(ctx, next) => {
  var id = ctx.checkParams('id').value;
  var action = ctx.checkQuery('act').value;
  if (id) {
    if (id === '*') {
      ctx.cache.clear();
      return ctx.redirect('/purge');
    }
    if (action == 'del') {
      ctx.cache.del(id);
      return ctx.redirect('/purge');
    }
    ctx.state.key = id;
    ctx.state.content = ctx.cache.get(id);
  }
  ctx.state.keys = ctx.cache.keys();
  ctx.state.cache = ctx.cache;
  await next();
};
