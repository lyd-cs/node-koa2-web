'use strict';

const util = require('../lib/util');

const {
  _
  // AJAX_SUCCESS,
  // AJAX_ERROR
} = util;

//const ErrMsg = require('../lib/errormsg');

const navList = [
  { k: 'company', v: '公司简介', id: 0, t: './mobile/about.company.pug' },
  { k: 'safety', v: '安全保障', id: 1, t: './mobile/about.safety.pug' },
  { k: 'risk', v: '风控体系', id: 2, t: './mobile/about.risk.pug' },
  // { k: 'news', v: '红上动态', id: 3, t: 'about.news.pug' },
  // { k: 'info', v: '信息披露', id: 2, t: 'about.info.pug' },
  {
    k: 'announcement',
    v: '网站公告',
    id: 4,
    t: './mobile/about.announcement.pug'
  },
  //{k: 'jobs', v: '招贤纳士',id: 4, t: 'about.jobs.pug'},
  { k: 'contact', v: '联系我们', id: 5, t: './mobile/about.contact.pug' },
  { k: 'platform', v: '平台数据', id: 6, t: './mobile/about.platform.pug' },
  { k: 'product', v: '产品介绍', id: 7, t: './mobile/about.product.intro.pug' },
  { k: 'audit', v: '审计报告', id: 8, t: './mobile/about.audit.report.pug' },
  { k: 'report', v: '运营报告', id: 9, t: './mobile/about.report.pug' },
  { k: 'law', v: '法律法规', id: 10, t: './mobile/about.law.pug' },
  { k: 'filing', v: '备案进程', id: 11, t: './mobile/about.filing.pug' }
];

const _agreements = {
  signup: './mobile/manual.signup.agree.pug',
  realname: './mobile/manual.realname.agree.pug',
  plan: './mobile/manual.plan.agree.pug',
  planMonth: './mobile/manual.plan.agree.pug',
  loan: './mobile/manual.loan.agree.pug',
  antimoney: './mobile/manual.antimoney.agree.pug',
  debts: './mobile/manual.debts.agree.pug',
  depository: './mobile/manual.depository.agree.pug',
  thirdpart: './mobile/manual.thirdpart.agree.pug',
  authorize: './mobile/manual.authorize.agree.pug',
  hint: './mobile/manual.hint.agree.pug'
};
const _annals = [
  { k: '2018Q1', v: '2018一季度运营报告', t: './mobile/about.report.2018Q1.pug' },
  { k: '2017', v: '2017运营年报', t: './mobile/about.report.2017.pug' },
  { k: '2016', v: '2016运营年报', t: './mobile/about.report.2016.pug' }
];
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
about.annals = async ctx => {
  const year = ctx.checkParams('id').value;
  let current;
  _.each(_annals, function(obj) {
    if (obj.k.toString() === year.toString()) {
      current = obj;
      return false;
    }
  });
  if (!current) {
    ctx.throw(404);
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
  const id = ctx.checkParams('id').value || '';
  if (!id) {
    ctx.throw(404);
  }
  let ret = await ctx.cache.home.get_app_announce_list();
  let announceDetail = ret.find(data => {
    return data.id.toString() == id.toString();
  });
  if (!announceDetail) {
    return await next();
  }
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

module.exports = about;
