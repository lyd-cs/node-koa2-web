'use strict';

/**
 * coupon
 **/
const ErrorStatus = require('../lib/status');
const ErrorMessage = require('../lib/errormsg');

const CouponModel = require('../model/coupon');

const {
  _,
  reCouponCode
} = require('../lib/util');


const coupon = async(ctx, next) => {
  await next();
};

// 我的优惠券列表
coupon.query = async(ctx) => {
  const service = ctx.service.coupon;

  const {
    userId,
    pageSize,
    pageNumber,
    ipAddress,
    platform
  } = ctx.args;
  const FILTER_TO_STATUS = {
    // 未使用
    'available': 'AVAILABLE',
    'used': 'USED'
  };
  const DEFAULT_FILTER = 'available';

  let filter = ctx.checkBody('filter').value;

  // 筛选条件
  if (!filter || !FILTER_TO_STATUS[filter]) {
    filter = DEFAULT_FILTER;
  }
  let status = FILTER_TO_STATUS[filter];

  const query = {
    userId,
    pageSize,
    pageNumber,
    status,
    ipAddress,
    platform
  };

  let values;
  let ret;

  try {
    // 可用列表
    // http://doc.hoomxb.com/index.php?s=/1&page_id=330
    values = await service.query(query, 'account/list');
    ret = {
      ...values,
      dataList: _.get(values, 'dataList', []).map(CouponModel),
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }
  ctx.dumpJSON(ret);
};

// 优惠券兑换
coupon.update = async(ctx) => {
  const service = ctx.service.coupon;

  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;
  const code = ctx.checkBody('code').notEmpty()
    .len(16, 16).match(reCouponCode).value;

  const query = {
    code,
    userId,
    ipAddress,
    platform
  };

  let values;
  let ret;

  if (ctx.errors) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED, ErrorMessage.isCouponCode);
    return;
  }

  try {
    values = await service.update(query, 'exchange');
    if (values && values.coupon) {
      ret = {
        coupon: CouponModel(values.coupon)
      };
    }
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }

  ctx.dumpJSON(ret);
};

// 最优优惠券, 根据id,amount, type
coupon.best = async(ctx) => {
  const service = ctx.service.coupon;

  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  const TYPE_TO_PRIMARY_KEY = {
    //计划
    'plan': 'financePlanId',
    //'loan': '标的',
    //'transfer': '债转'
  };
  const DEFAULT_PRODUCT_TYPE = 'plan';

  const id = ~~ctx.checkBody('id').toInt().value || 0;
  let type = ctx.checkBody('type').value;

  const query = {
    amount: ctx.checkBody('amount').toInt().value || 0,
    id,
    userId,
    ipAddress,
    platform
  };

  let key;
  let values;
  let ret;

  // 没有计划
  if (!id) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }
  if (!type || !TYPE_TO_PRIMARY_KEY[type]) {
    type = DEFAULT_PRODUCT_TYPE;
  }

  key = TYPE_TO_PRIMARY_KEY[type];
  if (key) {
    query[key] = id;
  }

  try {
    values = await service.fetch(query, `${type}/best`);
    const item = _.get(values, 'bestCoupon');
    // #FIXME
    ret = {
      hasCoupon: !!(_.get(values, 'hasPlanCoupon')),
      bestCoupon: item && CouponModel(item)
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }

  ctx.dumpJSON(ret);
};

// 购买选择优惠券列表，根据id,amount, type
coupon.queryBuy = async(ctx) => {
  const service = ctx.service.coupon;

  const {
    userId,
    ipAddress,
    platform
  } = ctx.args;

  const TYPE_TO_PRIMARY_KEY = {
    //计划
    'plan': 'financePlanId',
    //'loan': '标的',
    //'transfer': '债转'
  };
  const DEFAULT_PRODUCT_TYPE = 'plan';

  const id = ~~ctx.checkBody('id').toInt().value || 0;
  let type = ctx.checkBody('type').value;

  let key;
  let values;
  let ret;

  const query = {
    // 默认为空，没有输入金额，如果输入金额，金额必须为int
    amount: ctx.checkBody('amount').empty().default('').toInt().value,
    id,
    userId,
    ipAddress,
    platform
  };
  // 没有计划或者金额检查错误
  if (!id || ctx.errors) {
    ctx.dumpJSON(ErrorStatus.PARAMS_REQUIRED);
    return;
  }
  if (!type || !TYPE_TO_PRIMARY_KEY[type]) {
    type = DEFAULT_PRODUCT_TYPE;
  }

  key = TYPE_TO_PRIMARY_KEY[type];
  if (key) {
    query[key] = id;
  }

  try {
    values = await service.query(query, `${type}/buy`);
    ret = {
      dataList: _.get(values, 'useCoupons', []).map(CouponModel),
      unusableList: _.get(values, 'unUseCoupons', []).map(CouponModel),
      bestCoupon: _.get(values, 'bestCoupon.id', '')
    };
  } catch (error) {
    ctx.dumpJSON(ErrorStatus.SERVER_FAIL, error);
    return;
  }

  ctx.dumpJSON(ret);
};

module.exports = coupon;