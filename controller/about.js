'use strict';

const util = require('../lib/util');
const ErrMsg = require('../lib/errormsg');
const { _, AJAX_SUCCESS, AJAX_ERROR } = util;

const navList = [
  { k: 'company', v: '公司简介', id: 0, t: 'about.company.pug' },
  { k: 'safety', v: '安全保障', id: 1, t: 'about.safety.pug' },
  { k: 'risk', v: '风控体系', id: 2, t: 'about.risk.pug' },
  // { k: 'news', v: '红上动态', id: 3, t: 'about.news.pug'},
  // { k: 'info', v: '信息披露', id: 2, t: 'about.info.pug'},
  { k: 'announcement', v: '网站公告', id: 4, t: 'about.announcement.pug' },
  //{k: 'jobs', v: '招贤纳士',id: 4, t: 'about.jobs.pug'},
  { k: 'contact', v: '联系我们', id: 5, t: 'about.contact.pug' },
  { k: 'platform', v: '平台数据', id: 6, t: 'about.platform.pug' },
  { k: 'report', v: '运营报告', id: 7, t: 'about.report.pug' },
  { k: 'product', v: '产品介绍', id: 8, t: 'about.product.intro.pug' },
  { k: 'audit', v: '审计报告', id: 9, t: 'about.audit.report.pug' },
  { k: 'law', v: '法律法规', id: 10, t: 'about.law.pug' },
  { k: 'filing', v: '备案进程', id: 11, t: 'about.filing.pug' }
];
const _agreements = {
  signup: 'manual.signup.agree.pug',
  realname: 'manual.realname.agree.pug',
  plan: 'manual.plan.agree.pug',
  planMonth: 'manual.plan.agree.pug',
  loan: 'manual.loan.agree.pug',
  transfer: 'manual.transfer.agree.pug',
  deposit: 'manual.deposit.agree.pug',
  license: 'manual.license.agree.pug',
  hint: 'manual.hint.agree.pug',
  electronicSignature: 'manual.electronic.signature.pug',
  digitalCertificate: 'manual.digital.certificate.pug'
};
const about = async(ctx, next) => {
  await next();
};
about.navs = async ctx => {
  const service = ctx.service.about;
  let current;
  const { userId, ipAddress, platform } = ctx.args;
  const nav = ctx.checkParams('action').value;
  _.each(navList, function(obj) {
    if (obj.k.toString() === nav.toString()) {
      current = obj;
      return false;
    }
  });

  if (!current) {
    return ctx.redirect('/about/company');
  }

  const query = {
    userId,
    ipAddress,
    platform
  };
  if (nav === 'platform') {
    try {
      await service.query(query, 'platform').then(
        function(value) {
          ctx.state.platData = value;
        },
        function(err) {
          ctx.throw(err);
        }
      );
    } catch (e) {
      ctx.addError('page', e);
    }
  }

  ctx.state.aboutTitle = current.v;
  ctx.render(current.t);
};
about.announcement = async(ctx, next) => {
  var pageNumber = ctx.checkQuery('page').default(0).value - 0 || 1;
  var ret = await ctx.cache.home.get_announce_list();
  var size = 10;
  var dataList = ret.slice((pageNumber - 1) * size, pageNumber * size);
  var total = ret.length;
  var count = util.pageCount(total, size);

  if (pageNumber > total / size + 1 || !ret) {
    ctx.throw(404);
  }
  _.extend(ctx.state, {
    page: pageNumber,
    announcement: dataList,
    pageUrl: '?page=',
    totalCount: total,
    pageTotal: count
  });
  await next();
};
about.announcementDetail = async(ctx, next) => {
  var ret = await ctx.cache.home.get_announce_list();
  if (!ret) {
    ctx.throw(404);
  }
  var id = ctx.checkParams('id').value || '';
  if (!id) {
    ctx.throw(404);
  }
  var announceDetail = ret.find(function(data) {
    return data.id.toString() == id.toString();
  });

  ctx.state.announceDetail = announceDetail;
  await next();
};
about.agreement = async(ctx, next) => {
  const action = ctx.checkParams('action').value;
  const MONTHLY_PAYMENTS_PLAN = 'planMonth';
  const _tpl = _agreements[action];
  if (!_tpl) {
    ctx.status = 406;
    return await next();
  }
  action === MONTHLY_PAYMENTS_PLAN && (ctx.state.isMonthlyPaymentsPlan = true);
  ctx.state.tpl = _tpl;
  await next();
};
about.guideGetRate = async(ctx, next) => {
  var success = _.cloneDeep(AJAX_SUCCESS);
  var error = _.cloneDeep(AJAX_ERROR);
  const { userId, ipAddress, platform } = ctx.args;
  var query = {
    cashType: 'INVEST',
    userId,
    ipAddress,
    platform
  };
  var _value = await ctx.proxy.planListRecommend(query);
  if (!_value) {
    error.message = ErrMsg.def;
    ctx.body = error;
    return await next();
  }
  var ret = JSON.parse(_value);
  if (!ret || ret.status != 0) {
    error.message = ret.message;
    ctx.body = error;
    return await next();
  }

  success.data = {
    expectedRateByMonth: _.get(ret, 'data.expectedRateByMonth') || []
  };
  ctx.body = success;
  await next();
};
about.newsList = async(ctx, next) => {
  var _newList = _.get(mock.aboutNewsGetWary, 'data.dataList') || {};
  var _ary = [];
  for (var i = 0; i < _newList.length; i++) {
    _ary.unshift(_newList[i]);
  }
  _ary.join('');
  ctx.state.newsList = _ary;
  await next();
};
about.newsDetail = async(ctx, next) => {
  const id = ctx.checkParams('id').value || 0;
  ctx.state.content =
    _.get(mock.aboutNewsGetWary, 'data.dataList[' + (id - 1) + ']') || {};
  await next();
};
about.app = async(ctx, next) => {
  const {
    androidDownloadUrl,
    iphoneDownloadUrl
  } = await ctx.cache.home.get_app_global();
  Object.assign(ctx.state, {
    androidDownloadUrl: androidDownloadUrl || '',
    iphoneDownloadUrl: iphoneDownloadUrl || ''
  });
  await next();
};
about.helpList = async(ctx, next) => {
  ctx.state.listId = ctx.checkParams('id').value - 0 || 0;
  await next();
};
about.helpBankLimit = async(ctx, next) => {
  const { bankTips, bankCodeList } = util;
  Object.assign(ctx.state, {
    bankTips: bankTips,
    bankCodeList: bankCodeList
  });
  await next();
};

module.exports = about;
