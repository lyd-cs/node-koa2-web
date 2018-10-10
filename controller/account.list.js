'use strict';
const util = require('../lib/util');

const { _ } = util;

const HTTP_POST = 'POST';
/**
 * get filter
 */
function getLoanFilter() {
  var ctx = this;
  var filter = ctx.checkQuery('filter').default(1).value - 0 || 0;
  if (_.indexOf([1, 2, 3, 4], filter) === -1) {
    filter = 1;
  }
  return { filter: filter };
}

function getPlanFilter() {
  var ctx = this;
  var filter = ctx.checkQuery('filter').default(1).value - 0 || 0;
  if (_.indexOf([1, 2, 3], filter) === -1) {
    filter = 1;
  }
  return { filter: filter };
}

function getPlanFilter() {
  var ctx = this;
  var filter = ctx.checkQuery('filter').default(1).value - 0 || 0;
  if (_.indexOf([1, 2, 3], filter) === -1) {
    filter = 1;
  }
  return { filter: filter };
}
/**
 * filter to data
 */
function filterToData(data) {
  var dict = {
    '1': { type: 'REPAYING_LOAN' }, //收益中
    '2': { type: 'BID_LOAN' }, //投标中
    '3': { type: 'TRANSFERING_LOAN' }, //转让中
    '4': { type: 'FINISH_LOAN' } //已结清
  };
  var k = data.filter;
  if (!(k in dict)) {
    k = 1;
  }
  return dict[k];
}
/**
 * plan filter to data
 */
function planFilterToData(data) {
  var dict = {
    '1': { type: 'HOLD_PLAN' }, //收益中
    '2': { type: 'EXITING_PLAN' }, //退出中
    '3': { type: 'EXIT_PLAN' } //已退出
  };
  var k = data.filter;
  if (!(k in dict)) {
    k = 1;
  }
  return dict[k];
}
const list = async(ctx, next) => {
  await next();
};
list.loan = async(ctx, next) => {
  var data, query;
  const { userId, ipAddress, platform } = ctx.args;
  //var userid = 5373797;
  var _render = function() {
    ctx.state.query = query;
    ctx.state.errors = ctx.errors;
  };
  // query for page ui
  query = getLoanFilter.call(ctx);
  // data for api
  data = util.getListPageData.call(
    ctx,
    _.extend({}, filterToData(query), {
      version: '1.0',
      userId,
      ipAddress,
      platform
    })
  );
  if (ctx.method === HTTP_POST) {
    const _page = ctx.checkBody('page').default(0).value - 0 || 1;
    const _filter = ctx.checkBody('filter').default(1).value - 0 || 0;
    var _query = { filter: _filter };
    _.extend(ctx.state, {
      page: _page,
      pageUrl: util.getPageUrl(query),
      pageTotal: 0,
      pageSize: data.pageSize,
      query: { filter: _filter }
    });
    data = util.getListPageData.call(
      ctx,
      _.extend({}, filterToData(_query), {
        pageNumber: _page,
        version: '1.0',
        userId,
        ipAddress,
        platform
      })
    );
    await ctx.proxy.accountLoanList(data).then(
      function(val) {
        if (!val) {
          _render();
          ctx.state.dataList = null;
          return;
        }
        var ret = JSON.parse(val);
        var total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
        var size = _.get(ret, 'data.pageSize', 0) - 0 || 0;
        var count = util.pageCount(total, size);
        _.extend(ctx.state, {
          dataList: _.get(ret, 'data.loanList') || [],
          totalCount: total,
          pageTotal: count
        });
      },
      function() {}
    );
    return await next();
  }
  try {
    await Promise.all([
      ctx.proxy.accountLoanList(data),
      ctx.proxy.accountLoanAsset({
        userId,
        ipAddress,
        platform
      })
    ]).then(function(values) {
      var ret = util.toJSON(values[0]);
      var total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
      var size = _.get(ret, 'data.pageSize', 0) - 0 || 0;
      var _limitDays = _.get(ret, 'data.limitDays', 0) - 0 || 0;
      var count = util.pageCount(total, size);
      _.assign(ctx.state, {
        dataList: (values[0] && _.get(ret, 'data.loanList')) || [],
        limitDays: _limitDays,
        totalCount: total,
        pageTotal: count,
        ucAsset:
          (values[1] && _.get(util.toJSON(values[1]), 'data.loanStatis[0]')) ||
          []
      });
    });
  } catch (err) {}
  _render();
  await next();
};
list.plan = async(ctx, next) => {
  var data, query;
  const { userId, ipAddress, platform } = ctx.args;

  var _render = function() {
    ctx.state.query = query;
    ctx.state.errors = ctx.errors;
  };
  // query for page ui
  query = getPlanFilter.call(ctx);
  // data for api
  data = util.getListPageData.call(
    ctx,
    _.extend({}, planFilterToData(query), {
      userId,
      ipAddress,
      platform
    })
  );
  if (ctx.method === HTTP_POST) {
    const _page = ctx.checkBody('page').default(0).value - 0 || 1;
    const _filter = ctx.checkBody('filter').default(1).value - 0 || 0;
    _.extend(ctx.state, {
      page: _page,
      pageUrl: util.getPageUrl(query),
      pageTotal: 0,
      pageSize: data.pageSize,
      query: { filter: _filter }
    });
    data = util.getListPageData.call(
      ctx,
      _.extend({}, filterToData(query), {
        pageNumber: _page,
        userId,
        ipAddress,
        platform
      })
    );
    await ctx.proxy.accountPlanList(data).then(
      function(val) {
        if (!val) {
          _render();
          ctx.state.dataList = null;
          return;
        }
        var ret = JSON.parse(val);
        var total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
        var size = _.get(ret, 'data.pageSize', 0) - 0 || 0;
        var count = util.pageCount(total, size);
        _.extend(ctx.state, {
          dataList: _.get(ret, 'data.dataList') || [],
          totalCount: total,
          pageTotal: count
        });
      },
      function() {}
    );
    return await next();
  }
  try {
    await Promise.all([
      ctx.proxy.accountPlanList(data),
      ctx.proxy.accountPlanAsset({
        userId,
        ipAddress,
        platform
      })
    ]).then(function(values) {
      var ret = util.toJSON(values[0]);
      var total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
      var size = _.get(ret, 'data.pageSize', 0) - 0 || 0;
      var count = util.pageCount(total, size);
      _.assign(ctx.state, {
        dataList: (values[0] && _.get(ret, 'data.dataList')) || [],
        totalCount: total,
        pageTotal: count,
        ucAsset:
          (values[1] && _.get(util.toJSON(values[1]), 'data.dataList')) || []
      });
    });
  } catch (err) {}
  _render();
  await next();
};
list.tradList = async(ctx, next) => {
  var _url;
  const { userId, ipAddress, platform } = ctx.args;

  var _filter = ctx
    .checkQuery('filter')
    .optional()
    .empty().value;
  var _fundType = _.get(util.parseFundParentType(_filter), 'code') || '';
  var data = util.getListPageData.call(ctx);
  var _render = function() {
    ctx.state.query = ctx.query;
    ctx.state.errors = ctx.errors;
  };
  const _data = {
    pointSearchType: _fundType,
    startDay:
      ctx
        .checkQuery('start')
        .optional()
        .empty().value || '',
    endDay:
      ctx
        .checkQuery('end')
        .optional()
        .empty().value || '',
    pageNumber: data.pageNumber,
    pageSize: data.pageSize,
    userId,
    ipAddress,
    platform
  };
  _url =
    '?' +
    (_data.startDay
      ? 'start=' + _data.startDay + '&end=' + _data.endDay + '&'
      : '') +
    (_filter ? 'filter=' + _filter + '&' : '') +
    'page=';
  _.extend(ctx.state, {
    page: data.pageNumber,
    pageUrl: _url,
    pageTotal: 0,
    pageSize: data.pageSize
  });
  try {
    await ctx.proxy.getTradRecord(_data).then(
      function(value) {
        if (!value) {
          ctx.addError('page', errMsg.def);
          _render();
          return;
        }
        var ret = JSON.parse(value);
        var total = _.get(ret, 'data.totalCount', 0) - 0 || 0;
        var size = data.pageSize;
        var count = util.pageCount(total, size);
        _.assign(ctx.state, {
          dataList: (ret && _.get(ret, 'data.pointLog_list')) || [],
          totalCount: total,
          pageTotal: count
        });
      },
      function(err) {
        ctx.throw(err);
      }
    );
  } catch (e) {
    ctx.addError('page', e);
    _render();
    return await next();
  }
  _render();
  await next();
};
module.exports = list;
