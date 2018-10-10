/**
 * tpl
 */
const { _, AJAX_ERROR, AJAX_SUCCESS } = require('../lib/util');

var tpl = async(ctx, next) => {
  try {
    await next();
  } catch (err) {}
};

// tpl
tpl.html = function(template) {
  return async ctx => {
    var isMobile =
      ctx.request.get('appversion') ||
      ctx.request.get('clientType') ||
      ctx.request.get('sysversion');
    var status;
    var _tpl;

    status = ctx.status;
    if (isMobile) {
      ctx.state.isMobile = true;
    } else {
      ctx.state.isMobile = false;
    }
    // login
    if (status == 401) {
      ctx.redirect('/login');
      return;
    } else if (status == 400) {
      ctx.addError('page', msg);
      return;
    } else if (status == 406) {
      ctx.redirect('/error');
      return;
    }
    // tpl may change by state
    _tpl = _.get(ctx.state, 'tpl', template);
    if (ctx.errors) {
      ctx.state.errors = ctx.errors;
      ctx.render(_tpl);
      return;
    }
    ctx.render(_tpl);
  };
};

// json
tpl.json = async ctx => {
  var success = _.clone(AJAX_SUCCESS);
  var fail = _.clone(AJAX_ERROR);
  if (ctx.errors) {
    ctx.body = fail;
    return;
  }
  success.data = _.get(ctx.state, 'data', {});
  ctx.body = success;
};

// json html
tpl.jsonHtml = function(template) {
  return async ctx => {
    var success = _.clone(AJAX_SUCCESS);
    var fail = _.clone(AJAX_ERROR);
    var _tpl;
    if (ctx.errors) {
      fail.data = util.arr2obj(ctx.errors);
      ctx.body = fail;
      return;
    }
    _tpl = _.get(ctx.state, 'tpl', template);
    ctx.render(_tpl);
    success.data = _.get(ctx.state, 'data', {});
    success.data.html = ctx.body;
    ctx.body = success;
  };
};

module.exports = tpl;
