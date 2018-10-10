/**
 * jade ui helper
 */
var url = require('url');

var accounting = require('accounting');

var util = require('./util');
var statics = require('./static')(util.setting);
var cityList = require('./city');
var moment = util.moment;
//var _ = util.lodash;
var ErrMsg = require('./errormsg');
//var cache = {}

//var STATIC_HOST = util.setting.avatar.host;
// format money
accounting.settings.currency.format = '%v';
exports.accounting = accounting;
exports.toFixed = accounting.toFixed;
exports.formatNumber = accounting.formatNumber;
exports.formatMoney = accounting.formatMoney;
// safe
exports.safeMobile = util.safeMobile;
exports.safeIdentity = util.safeIdentity;
exports.safeBank = util.safeBank;
exports.safeRealname = util.safeRealname;
//exports.STATIC_HOST = STATIC_HOST;
exports.pageCount = util.pageCount;
// bank
exports.getBank = util.getbank;
// bank limit show
exports.limitShow = util.limitShow;
// static url
exports.static_url = statics;
// fund Status
exports.fundStatus = function(id) {
  return util.FUND_STATUS[id] || '';
};
exports.parseStatus = util.parseStatus;
exports.parsePlanStatus = util.parsePlanStatus;
exports.productPlanStatus = util.productPlanStatus;
exports.heroLever = util.heroLever;
exports.followplusType = util.followplusType;
exports.parseLoanStatusName = util.parseLoanStatusName;
exports.parseLoanStatusCode = util.parseLoanStatusCode;
exports.parseLoanStatus = util.parseLoanStatus;

exports.arr2obj = util.arr2obj;
exports.parseLoanType = util.parseLoanType;
exports.safeUserName = util.safeUserName;
exports.parseLoanRepaidType = util.parseLoanRepaidType;
exports.parseLoanDetailMarriageStauts = util.parseLoanDetailMarriageStauts;
exports.parseProductErrorCode = util.parseProductErrorCode;
exports.parseLoanAgreementSourceStatus = util.parseLoanAgreementSourceStatus;
exports.parseTransferText = util.parseTransferText;
exports.parseTransferStatus = util.parseTransferStatus;
exports.city = cityList.city;
exports.parseCouponType = util.parseCouponType;
exports.parseCouponStatus = util.parseCouponStatus;
exports.parseCouponState = util.parseCouponState;
exports.ebankCodeList = util.ebankCodeList;
exports.ebankLimitList = util.ebankLimitList;
exports.parsePlanPayments = util.parsePlanPayments;
exports.parseMonthlyPlanCashDrawDay = util.parseAccountPlanListCashDrawDay;
exports.parseApplyPeople = util.parseApplyPeople;
exports.parseLoanDetailCheckStatus = util.parseLoanDetailCheckStatus;
exports.loanDetailDescription = util.loanDetailDescription;
exports.loanDetailSecurityLevel = ErrMsg.loanDetailSecurityLevel;
exports.extendLockPeriod = util.extendLockPeriod;

//banklist
exports.bankTips = util.bankTips;
exports.bankCodeList = util.bankCodeList;
//progress
exports.productProgress = function(data) {
  var _progress = data - 0;
  if (_progress == 0) {
    return 0;
  } else if (_progress < 1) {
    return 1;
  } else if (_progress <= 99) {
    return accounting.formatNumber(_progress);
  } else if (_progress < 100) {
    return 99;
  } else if ((_progress = 100)) {
    return 100;
  }
};
// status
exports.showStatus = function(id) {
  return util.STATUS[id] || '';
};
// Sub Category
exports.parseSubCategory = function(id) {
  return exports.SUBCATEGORY[id] || '';
};
// followplus invest type
exports.parseInvestType = function(id) {
  return exports.FOLLOWPLUS_INVEST_TYPE[id] || '';
};
// account cash type
exports.parsePlanCashType = function(id) {
  return util.parsePlanCashType(id);
};
// format date
exports.moment = moment;
// gen static
exports.gen_static_url = function(uri) {
  if (uri) {
    return url.resolve(STATIC_HOST, uri);
  }
};
// format date
exports.formatdate = function(format, date) {
  format = format || 'YYYY-MM-DD';
  var time = date || new Date();
  return moment(time).format(format);
};
// diff date
exports.diffDate = function(start, end) {
  var _end = end || Date.now();
  var diff = Math.abs(_end - start);
  var floor = Math.floor;
  var data = {
    day: 0,
    hour: 0,
    minute: 0,
    second: 0
  };
  data.day = floor(diff / 864e5); // 1000 * 60 * 60 * 24, negate dst
  diff -= data.day * 864e5;
  data.hour = floor(diff / 36e5); // 1000 * 60 * 60
  diff -= data.hour * 36e5;
  data.minute = floor(diff / 6e4); // 1000 * 60
  diff -= data.minute * 6e4;
  data.second = floor(diff / 1e3); // 1000
  return data;
};

exports.parsePlanDetailStatus = function(id) {
  var ret = {};
  var keys = ['HOLD_PLAN', 'EXITING_PLAN', 'EXIT_PLAN', 'PURCHASEING'];
  keys.forEach(function(k) {
    if (id === k) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};
// cut string
exports.cutStr = function(val, len, ellipsis) {
  len = len - 0 || 10;
  ellipsis = ellipsis ? ellipsis : '...';
  if (!val) {
    return '';
  }
  var _len = val.length;
  var max = len + 2;
  if (_len < max) {
    return val;
  }
  return val.slice(0, len) + ellipsis;
};
// random
exports.random = function(max, min) {
  if (!isNaN(max)) {
    if (!isNaN(min)) {
      return Math.round(Math.random() * (max - min) + min);
    } else {
      return Math.round(Math.random() * max);
    }
  }

  return max;
};

exports.releaseTime = function(startTime, endTime) {
  var countUpTime = accounting.formatNumber(
    (endTime - startTime) / (1000 * 60 * 60 * 24)
  );
  if (countUpTime >= 1) {
    return countUpTime + '<span>天</span>';
  } else {
    return '<span>不足</span>1<span>天</span>';
  }
};

exports.parseCouponAvaliableUseProduct = function(product) {
  var data = util.parseCouponUsedProduct(product);
  var productName = '';
  var arrMonth;
  // var planMonth, loan, plan, loanTransfer;
  if (data.loan) {
    productName = productName + '散标';
  }
  if (data.loan_transfer) {
    productName = productName + '债权';
  }
  if (data.plan || (data.planDetail && data.planDetail.length)) {
    productName = productName + '红利智投';
    if (!data.plan) {
      arrMonth = data.planDetail.join('/');
      productName = productName + '(' + arrMonth + '个月）';
    }
  }
  return productName;
};

//coupon used product
exports.parseCouponUsedProduct = function(product) {
  var productName;
  var regExp = /^F(\d+)$/;
  if (product == 'LOAN') {
    productName = '散标';
  } else if (product == 'LOAN_TRANSFER') {
    productName = '债权';
  } else if (product.match(regExp)) {
    productName = '红利智投' + product.slice(1) + '个月';
  }
  return productName;
};

//coupon overdue time
exports.parseCouponOverdueTime = function(expireTime) {
  var currentTime = new Date();
  var oneDay = 1 * 24 * 3600 * 1000,
    twoDays = 2 * 24 * 3600 * 1000,
    threeDays = 3 * 24 * 3600 * 1000;
  var timeDiff = expireTime - currentTime;
  var remainDays;
  if (timeDiff <= oneDay) {
    remainDays = '0';
  } else if (timeDiff <= twoDays) {
    remainDays = '1';
  } else if (timeDiff <= threeDays) {
    remainDays = '2';
  }
  return remainDays;
};

//unbindBankCard used bankCard slice 4
exports.reBankCardSlice = function(bankCard) {
  if (!bankCard || bankCard.length < 8) {
    return '****';
  }
  return bankCard.replace(util.reBankCardReplace, '$3');
};

/**
 * sayHi
 *
 * @returns {string}
 */
exports.sayHi = function sayHi() {
  var now = new Date();
  var _hours = now.getHours();
  if (_hours < 5) {
    return '凌晨好！';
  } else if (_hours < 8) {
    return '早上好！';
  } else if (_hours < 11) {
    return '上午好！';
  } else if (_hours < 14) {
    return '中午好！';
  } else if (_hours < 19) {
    return '下午好！';
  } else if (_hours < 24) {
    return '晚上好！';
  } else {
    return '夜里好！';
  }
};

/**
 * parseIncomeExtent
 *
 * @param {number} number of income
 * @returns {string} description of income
 */

exports.parseIncomeExtent = function parseIncomeExtent(money) {
  if (money < 1000) {
    return '1000元及以下';
  } else if (money < 2000) {
    return '1000-2000元';
  } else if (money < 5000) {
    return '2000-5000元';
  } else if (money < 10000) {
    return '5000-10000元';
  } else if (money < 20000) {
    return '10000-20000元';
  } else if (money < 50000) {
    return '20000-50000元';
  } else if (money > 50000) {
    return '50000元以上';
  } else {
    return '无';
  }
};
