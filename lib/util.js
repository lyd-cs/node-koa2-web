/**
 * util
 */

const queryString = require('querystring');
const { URL } = require('url');

const accounting = require('accounting');
const _ = require('lodash');
const moment = require('moment');
const uuid = require('node-uuid');
const log4js = require('log4js');
const logger = require('log4js').getLogger('util');
const bcrypt = require('bcrypt-nodejs');

const conf = require('./conf');
const typecode = require('./typecode');

const setting = require('../setting');
var bankList = {};
var bankCode = [];
var defaultBankList = {
  '5006': {
    name: '招商银行',
    single: '20万',
    day: '20万'
  },
  '5004': {
    name: '民生银行',
    single: '50万',
    day: '500万'
  },
  '5005': {
    name: '广发银行',
    single: '50万',
    day: '无限额'
  },
  '0150': {
    name: '农业银行',
    single: '10万',
    day: '20万'
  },
  '0201': {
    name: '交通银行',
    single: '10万',
    day: '10万'
  },
  '5012': {
    name: '北京银行',
    single: '5万',
    day: '10万'
  },
  '0210': {
    name: '中国银行',
    single: '5万',
    day: '20万'
  },
  '5000': {
    name: '邮储银行',
    single: '5万',
    day: '10万'
  },
  '5003': {
    name: '华夏银行',
    single: '5万',
    day: '10万'
  },
  '0160': {
    name: '工商银行',
    single: '5万',
    day: '5万'
  },
  '5007': {
    name: '兴业银行',
    single: '5万',
    day: '5万'
  },
  '5008': {
    name: '浦发银行',
    single: '5万',
    day: '5万'
  },
  '5002': {
    name: '光大银行',
    single: '5万',
    day: '5万'
  },
  '5009': {
    name: '平安银行',
    single: '5万',
    day: '5万'
  },
  '0220': {
    name: '建设银行',
    single: '2万',
    day: '2万'
  }
};
var defaultBankCodeList = [
  '5006',
  '5004',
  '5005',
  '0150',
  '0201',
  '5012',
  '0210',
  '5000',
  '5003',
  '0160',
  '5007',
  '5008',
  '5002',
  '5009',
  '0220',
  '5001',
  '0170',
  '5011',
  '5013',
  '1114',
  '0250',
  '5186'
];
//var ebankCodeList = ['0160', '0150', '0210', '0220', '5006', '5002', '0201', '5007', '5004', '5003', '5012', '5000', '5001', '5008', '5010', '5009', '5005', '0170', '5011', '5013', '1114', '0250', '5186'];
var ebankCodeList = [
  '3002',
  '3005',
  '3026',
  '3003',
  '3001',
  '3022',
  '3009',
  '3006',
  '3050',
  '3032',
  '3038',
  '3039',
  '3035',
  '3036',
  '3059'
];
var ebankLimitList = {
  '3001': {
    name: '招商银行',
    limit: [
      {
        single: '500',
        day: '500',
        choose: '大众版'
      },
      {
        single: '500万',
        day: '1000万以上',
        choose: '专业版'
      }
    ]
  },
  '3002': {
    name: '工商银行',
    limit: [
      {
        single: '1万',
        day: '1万',
        choose: 'e支付'
      },
      {
        single: '500万',
        day: '无限额',
        choose: '网银支付'
      }
    ]
  },
  '3003': {
    name: '建设银行',
    limit: [
      {
        single: '5万',
        day: '10万',
        choose: '网银盾1代'
      },
      {
        single: '50万',
        day: '50万',
        choose: '网银盾2代'
      }
    ]
  },
  '3026': {
    name: '中国银行',
    limit: [
      {
        single: '1000',
        day: '1000',
        choose: '中银快付'
      },
      {
        single: '5万',
        day: '20万',
        choose: 'USBKey证书认证、令牌+动态口令'
      }
    ]
  },
  '3005': {
    name: '农业银行',
    limit: [
      {
        single: '1000',
        day: '1000',
        choose: 'K码支付'
      },
      {
        single: '100万',
        day: '500万',
        choose: 'K宝'
      }
    ]
  },
  '3009': {
    name: '兴业银行',
    limit: [
      {
        single: '日累积范围内无限额',
        day: '初始5000，可至网点加大',
        choose: '手机动态密码版'
      },
      {
        single: '40万',
        day: '100万',
        choose: 'U盾'
      }
    ]
  },
  '3036': {
    name: '广发银行',
    limit: [
      {
        single: '3000',
        day: '3000',
        choose: '手机动态密码版'
      },
      {
        single: '5000',
        day: '5000',
        choose: 'key盾/key令'
      }
    ]
  },
  '3006': {
    name: '民生银行',
    limit: [
      {
        single: '300',
        day: '300',
        choose: '大众版'
      },
      {
        single: '5000',
        day: '5000',
        choose: '贵宾版'
      },
      {
        single: '50万',
        day: '50万',
        choose: 'U宝用户'
      }
    ]
  },
  '3022': {
    name: '光大银行',
    limit: [
      {
        single: '1万',
        day: '1万',
        choose: '手机动态密码'
      },
      {
        single: '100万',
        day: '100万',
        choose: '令牌动态密码及阳光网盾验证方式'
      }
    ]
  },
  '3032': {
    name: '北京银行',
    limit: [
      {
        single: '300',
        day: '300',
        choose: '普通版'
      },
      {
        single: '1000',
        day: '5000',
        choose: '动态密码版'
      },
      {
        single: '100万',
        day: '100万',
        choose: '证书版'
      }
    ]
  },
  '3035': {
    name: '平安银行',
    limit: [
      {
        single: '5万',
        day: '5万',
        choose: '网银'
      }
    ]
  },
  '3039': {
    name: '中信银行',
    limit: [
      {
        single: '1000',
        day: '5000',
        choose: '手机动态密码'
      },
      {
        single: '100万',
        day: '100万',
        choose: 'U盾'
      }
    ]
  },
  '3050': {
    name: '华夏银行',
    limit: [
      {
        single: '300',
        day: '1000',
        choose: '卡密码校验'
      },
      {
        single: '1000',
        day: '5000',
        choose: '手机动态验证码'
      },
      {
        single: '5000',
        day: '10万',
        choose: 'U盾'
      }
    ]
  },
  '3038': {
    name: '邮政储蓄银行',
    limit: [
      {
        single: '1万',
        day: '1万',
        choose: '手机短信客户'
      },
      {
        single: '20万',
        day: '20万',
        choose: '电子令牌+短信客户'
      },
      {
        single: '100万',
        day: '100万',
        choose: 'Ukey+短信客户'
      }
    ]
  },
  '3059': {
    name: '上海银行',
    limit: [
      {
        single: '6000',
        day: '1万',
        choose: '办理动态密码版个人网银（含文件证书），开通网上支付功能'
      },
      {
        single: '10万',
        day: '100万',
        choose: '办理E盾证书版个人网银，开通网上支付功能'
      }
    ]
  }
};

log4js.configure(setting.loggerConfig);
moment.locale('zh-cn');
//console.log(setting.loggerConfig);
exports.log4js = log4js;
exports.moment = moment;
exports.formatNumber = accounting.formatNumber;
exports.toFixed = accounting.toFixed;
exports.lodash = exports._ = _;

exports.reRealname = /^[\u0391-\uFFE5]{2,6}$/;
exports.reRealMinorityName = /^([\u4e00-\u9fa5]+(·[\u4e00-\u9fa5]+)*){2,20}$/;
exports.reNickName = /^[\u4E00-\u9FA5A-Za-z0-9_]{2,12}$/;
exports.reMobile = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
exports.reSms = /^[0-9]{6}$/;
exports.reAmount = /^(?:[1-9][0-9]*)0{3}$/;
exports.reAvatarType = /(jpg|jpeg|png)$/i;
exports.reAvatarCrop = /^(\d+)(_\d+){2}/;
exports.reMobileReplace = exports.mobileReplace = /^(\d{3})(.*)(\d{4})$/;
exports.reIdentityReplace = /^(.{1})(.*)(.{1})$/;
exports.reBankCardReplace = /^(.{4})(.*)(.{4})$/;
exports.reUserNameReplace = /^(.{3})(.*)(.{4})$/;
exports.reRealnameReplace = /^(.*)(.{1})$/;
exports.reHostname = /hoomxb\.com/;
exports.checkBbsUrl = /src=[\'\"]?([^\'\"]*)[\'\"]?/i;
exports.checkPassword = /^(?![^a-zA-Z]+$)(?!\D+$)/;
exports.checkInvitationCode = /^[a-zA-Z0-9]+$/i;
exports.reCash = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
exports.reCouponCode = /^[A-Za-z0-9]{16}$/;

exports.setting = exports.config = setting;

exports.AJAX_ERROR = {
  status: 403,
  message: 'params required',
  data: null
};
exports.AJAX_SUCCESS = {
  status: 0,
  message: 'success',
  data: null
};
exports.API_ERROR = {
  status: 1,
  message: '操作失败，稍后重试',
  data: null
};
exports.API_SUCCESS = {
  status: 0,
  message: 'success',
  data: {}
};

exports.parseLoanType = conf.parseLoanType;
exports.parseLoanRepaidType = conf.parseLoanRepaidType;
exports.parseLoanDetailMarriageStauts = conf.parseLoanDetailMarriageStauts;
//exports.parsePlanStatus = conf.parsePlanStatus;
exports.parsePlanCashType = conf.parsePlanCashType;
exports.parsePlanCashTypeApp = conf.parsePlanCashTypeApp;
exports.parseFundParentType = conf.parseFundParentType;
exports.parseLoanAgreementSourceStatus = conf.parseLoanAgreementSourceStatus;
exports.parseTransferText = conf.parseTransferText;
exports.parseApplyPeople = conf.parseApplyPeople;

exports.TYPECODE = typecode;
exports.BUY_TYPE = conf.BUY_TYPE;
exports.BUY_CONFIRM_ERROR = conf.BUY_CONFIRM_ERROR;
exports.parseCouponType = conf.parseCouponType;
exports.ebankCodeList = ebankCodeList;
exports.ebankLimitList = ebankLimitList;

exports.DEFAULT_PAGE_SIZE = 20;
exports.MIN_USER_CHARGE_AMOUNT = 1;
exports.MIN_USER_WITHDRAW_AMOUNT = 1;
// 收益再处理方式
const INCOME_TREATMENT = {
  // 提现到hxb账户
  CASH: 'HXB',
  // 投资
  INVEST: 'INVEST'
};
exports.INCOME_TREATMENT = INCOME_TREATMENT;

exports.planKeyWords =
  '红小宝，红上金融，投资理财，互联网金融，P2P网贷，P2P理财，分散投资';
exports.planDesc =
  '红利智投是红小宝平台推出的，用户授权系统本金自动循环出借及到期可转让的智能投标工具';
exports.loanKeyWords =
  '红小宝，红上金融，资金周转贷，消费金融，普惠金融，P2P理财，互联网理财';
exports.loanDesc =
  '散标投资是红小宝平台推出的线上个人投融资交易服务，项目透明，等额本息，5道风控，签署电子协议，多重本息保障，100元起投，年化收益高达12.6%。';
exports.quitWayDefault = '锁定期结束后可随时申请退出';
exports.quitWaysDesc =
  '1、用户加入红利智投，锁定期结束后可随时申请退出红利智投；\n2、锁定期后申请退出有5天时间可撤销退出，期间收益继续持有，5天后以债权转让形式进行退出。';

var parseBankList = function(value) {
  bankCode.splice(0);
  bankList = value.reduce(function(bankItem, currentValue) {
    if (currentValue.quotaStatus != '0') {
      bankItem[currentValue.bankCode] = {
        name: currentValue.bankName,
        single: currentValue.perSumQuota,
        day: currentValue.perDayQuota,
        quotaStatus: currentValue.quotaStatus
      };
    }
    return bankItem;
  }, {});
  bankCode = value.reduce(function(accumulator, currentValue) {
    accumulator.push(currentValue.bankCode);
    return accumulator;
  }, []);
};
Object.defineProperty(exports, 'bankCodeList', {
  get: () => {
    if (bankCode.length) {
      return bankCode;
    }
    return defaultBankCodeList;
  },
  set: value => {
    if (value) {
      parseBankList(value);
    }
  }
});

Object.defineProperty(exports, 'bankTips', {
  get: () => {
    if (Object.keys(bankList).length) {
      return bankList;
    }
    return defaultBankList;
  },
  set: value => {
    if (value) {
      parseBankList(value);
    }
  }
});

exports.limitShow = function(obj = {}, isLimitTip) {
  if (obj.quotaStatus == '2') {
    return '银行系统维护中';
  } else {
    const limitSingleTips = obj.single ? '单笔' + obj.single : '';
    const limitDayTips = obj.day ? '单日' + obj.day : '';
    const limitTipWord = !limitSingleTips && !limitDayTips ? '' : '限额：';
    return isLimitTip
      ? limitTipWord + limitSingleTips + limitDayTips
      : limitSingleTips + limitDayTips;
  }
};
/**
 * 有效期过滤器
 */
exports.availableTimeFilter = function(item) {
  const now = Date.now();
  // 有效期内
  const start = _.get(item, 'start') - 0 || 0;
  const end = _.get(item, 'end') - 0 || 0;
  if (start < now && (!end || now < end)) {
    return true;
  }
};

/**
 * permission filter function
 * @param {Object} option default to {platform, permission, promotion}
 */
exports.permissionFilter = function(opt = {}) {
  //let { platform, permission, promotion } = opt;
  function checkAttr(data, key) {
    var val = data[key];
    var check = opt[key];
    if (!val || val === 'all' || val === check) {
      //console.log('true|', key, val, '===', check);
      return true;
    }
    //console.log('false|', key, val, '===', check);
    return false;
  }
  function checkPermission(data) {
    //all, user, guest, sales, notsales
    var val = data['permission'];
    //console.log('permission', val, '===');
    if (!val || val === 'all') {
      return true;
    }
    if (val === 'user' && !!opt.isLogin) {
      return true;
    }
    if (val === 'guest' && !opt.isLogin) {
      return true;
    }
    if (val === 'sales' && !!opt.isSales) {
      return true;
    }
    if (val === 'notsales' && !opt.isSales) {
      return true;
    }
    //console.log('false');
    return false;
  }
  return function(item) {
    var result = true;
    ['platform', 'promotion'].forEach(function(key) {
      result = result && checkAttr(item, key);
    });
    result = result && checkPermission(item);
    //console.log(result, JSON.stringify(item), JSON.stringify(opt));
    return result;
  };
};

exports.toJSON = function(v) {
  return JSON.parse(v);
};

// 按月提取收益
exports.parseAccountPlanListCashDrawDay = function(id) {
  if (!id) {
    id = '';
  }
  return '每月' + id + '日提取收益';
};

/**
 * 是否是按月提取收益产品
 */
exports.parsePlanPayments = function(id) {
  if (!id) {
    return false;
  }
  return id === INCOME_TREATMENT.CASH;
};

// parse loan StatusName
exports.parseLoanStatusName = function(id) {
  if (!id) {
    id = 'OPEN';
  }
  var statusData = conf.parseLoanStatus(id);
  return _.get(statusData, 'name');
};

// product plan status
exports.productPlanStatus = function(id) {
  return conf.parsePlanStatus(id);
};

// now
exports.now = function(fmt) {
  fmt = fmt || 'YYYY-MM-DD HH:mm:ss.SSS';
  return moment().format(fmt);
};

// plan quit result description
exports.planQuitResultDesc = function(quitTime) {
  return `您已申请退出，将在${moment(quitTime).format(
    'YYYY-MM-DD'
  )}开始退出，期间可撤销退出，收益会继续享有。`;
};

// diffTime
exports.diffTime = function(item) {
  if (!item) {
    return;
  }
  var _biginSellTime = _.get(item, 'beginSellingTime');
  var _timestamp = moment(_biginSellTime).format('x');
  var _now = Date.now();
  //var _time = moment(_now).format('YYYY-MM-DD HH:mm:ss');
  var _diffTime = _timestamp - _now;
  return _.extend(item, {
    diffTime: _diffTime
  });
};

exports.diffTimeStab = function(item) {
  if (!item) {
    return;
  }
  var _biginSellTime = _.get(item, 'beginSellingTime');
  var _now = Date.now();
  var _diffTime = _biginSellTime - _now;
  return _.extend(item, {
    diffTime: _diffTime
  });
};

exports.chargeBanlanceAddTag = function(item) {
  if (!item) {
    return;
  }
  var _balance = _.get(item, 'balance') - 0;
  var _newBalance = accounting.formatNumber(_balance, 2);
  var _itemtime = new Date(_.get(item, 'time') - 0);
  var timeHandler = function(time) {
    return {
      year: time.getFullYear(),
      month: time.getMonth()
    };
  };
  var _addTimeFlag = function(time) {
    var currentDate = timeHandler(new Date()),
      itemDate = timeHandler(time);
    if (
      currentDate.year === itemDate.year &&
      currentDate.month === itemDate.month
    ) {
      return '本月';
    }
    if (
      currentDate.year === itemDate.year &&
      currentDate.month !== itemDate.month
    ) {
      return itemDate.month + 1 + '月';
    }
    if (currentDate.year !== itemDate.year) {
      return itemDate.year + '年' + (itemDate.month + 1) + '月';
    }
  };
  return _.extend(item, {
    balance: _newBalance,
    tag: _addTimeFlag(_itemtime)
  });
};

exports.encryptName = function(name = '', dataList = []) {
  name = name ? name.toLowerCase() : '';
  return _.map(dataList, function(item) {
    if (!item) {
      return;
    }
    for (var prop in item) {
      if (prop.toLowerCase().indexOf('name') !== -1) {
        var nameValue = item[prop] ? item[prop].toLowerCase() : '';
        if (name !== nameValue) {
          item[prop] = exports.safeUserName(nameValue);
        }
      }
    }
    return item;
  });
};
// checkPageSize
exports.checkPageSize = (number, def) => {
  number = ~~number || def || 1;
  if (number < 1) {
    number = 1;
  }
  if (number > 200) {
    number = 20;
  }
  return number;
};

// checkPage
exports.checkPage = (number, def) => {
  number = ~~number || def || 1;
  if (number < 1) {
    number = 1;
  }
  return number;
};

// parse useragent
exports.parseUserAgent = (userAgent = '') => {
  var UA = userAgent.toLowerCase();
  var list = UA.split('/');
  //var isIE = UA && /msie|trident/.test(UA);
  //var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
  //var isEdge = UA && UA.indexOf('edge/') > 0;
  var isAndroid = UA && UA.indexOf('android') > 0;
  var isIOS = UA && /iphone|ipad|ipod|ios/.test(UA);
  //var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;
  var isIPhoneX = UA && /iphone x/.test(UA) && isIOS;
  var system = _.get(list, '[1]');
  var systemVersion = system && _.get(system.split(' '), '[1]');
  var app = _.get(list, '[2]');
  var appVersion = app && _.get(app.split(' '), '[0]');
  appVersion = appVersion && appVersion.slice(1);
  return {
    isIPhoneX,
    isAndroid,
    isIOS,
    system: systemVersion,
    version: appVersion
  };
};

// compare version
exports.versionCompare = (a = '', b = '') => {
  if (a === b) {
    return 0;
  }
  const arrayA = a.trim().split('.');
  const arrayB = b.trim().split('.');
  const lenA = arrayA.length;
  const lenB = arrayB.length;
  const min = Math.min(lenA, lenB);

  for (var i = 0; i < min; i++) {
    let eleA = String(arrayA[i]);
    let eleB = String(arrayB[i]);
    if (isNaN(eleA) || isNaN(eleB)) {
      let ret = eleA.localeCompare(eleB);
      //如果不相等
      if (ret !== 0) {
        return ret;
      }
    }
    if (eleA !== eleB) {
      return eleA - eleB;
    }
  }
  if (lenA === lenB) {
    return 0;
  }
  return lenA - lenB;
};

// 格式化资源url
exports.formatURL = (input, base = setting.webDomain) => {
  return new URL(input, base);
};

/**
 * uuid
 */
exports.uuid = function() {
  return uuid();
};

/**
 * arrary to object
 */
exports.arr2obj = function(arr) {
  var obj = {};
  arr.forEach(function(el) {
    Object.keys(el).forEach(function(k) {
      if (!obj[k]) {
        obj[k] = [];
      }
      obj[k].push(el[k]);
    });
  });
  return obj;
};

/**
 * safe mobile
 */
exports.safeMobile = function(val) {
  if (!val || val.length < 7) {
    return '*******';
  }
  return val.replace(exports.mobileReplace, '$1****$3');
};
// safe realname
exports.safeRealname = function(val) {
  if (!val) {
    return '**';
  }
  return val.replace(exports.reRealnameReplace, '*$2');
};
/**
 * safe mobile
 */
exports.safeIdentity = function(val) {
  if (!val || val.length < 18) {
    return '****';
  }
  return val.replace(exports.reIdentityReplace, '$1**** **** **** ***$3');
};
/**
 * safe mobile
 */
exports.safeBank = function(val) {
  if (!val || val.length < 8) {
    return '****';
  }
  return val.replace(exports.reBankCardReplace, '$1 **** **** $3');
};
/**
 * safe username
 */
exports.safeUserName = function(val) {
  if (!val || val.length < 8) {
    return '****';
  }
  var value = val.toLowerCase();
  return value.replace(exports.reUserNameReplace, '$1***$3');
};
/**
 * redis key user
 */
exports.k_mobile = function(mobile) {
  return ['m:', mobile].join('');
};
exports.k_user = function(userid) {
  /**
   * redis key user
   */
  return ['u:', userid].join('');
};
/**
 * redis key nickname
 */
exports.white_list = function() {
  return 'white_list';
};
/**
 * redis key login
 */
exports.k_user_login = function(userid) {
  return ['u_login:', userid].join('');
};

/**
 * redis key product
 */
exports.k_product = function(productid) {
  return ['p:', productid].join('');
};
/**
 * redis key userinvest
 */
exports.k_invest = function(productid) {
  return ['userinvest:', productid].join('');
};
// get page url
exports.getPageUrl = function(query) {
  var key = 'page';
  if (query && key in query) {
    delete query[key];
  }
  return ['?', queryString.stringify(query), '&page='].join('');
};
/**
 * list page params
 */
exports.getListPageData = function(opt) {
  var page = this.checkQuery('page').default(0).value - 0 || 1;
  var data = _.extend(
    {},
    {
      pageNumber: page,
      pageSize: 20,
      pageDisplay: 10,
      ipAddress: this.ip
    },
    opt
  );
  return data;
};
// get page url
exports.getAjaxPageUrl = function(url, query, page) {
  var key = 'page';
  if (query.indexOf('?') == 0) {
    query = query.slice(1, -1);
  }
  query = queryString.parse(query);
  if (query && key in query) {
    delete query[key];
  }
  return [url, '?', queryString.stringify(query), '&page=', page].join('');
};

exports.smscode = {
  signup: 'REGISTER',
  forgot: 'RESETPASSWORD',
  tradpwd: 'RESETCASHPWD',
  oldmobile: 'CHECKOLDMOBILE',
  newmobile: 'UPDATEMOBILE',
  signupVoice: 'REGISTER',
  inviteRegister: 'REGISTER',
  carnival: 'REGISTER',
  planquit: 'APPLYQUIT',
  calmperiod: 'COOLINGOFF'
};
/**
 * calc page count
 */
exports.pageCount = function(total, size) {
  return Math.floor((total + size - 1) / size);
};
/**
 * encrypt password
 */
exports.bhash = function(val) {
  // if ( setting.debug ) {
  //   return val;
  // }
  try {
    return bcrypt.hashSync(val);
  } catch (error) {
    logger.debug('bcrypt.bhash', error);
  }
  return val;
};
exports.bcompare = function(val, hash) {
  if (setting.debug) {
    return val === hash;
  }
  try {
    return bcrypt.compareSync(val, hash);
  } catch (error) {
    logger.debug('bcrypt.bcompare', error);
  }
  return false;
};
/**
 * parseStatus
 */
exports.parsePlanStatus = function(id) {
  var ret = {};
  var keys = [
    'wait_reserve',
    'reserveing',
    'reserve_full',
    'wait_open',
    'opening',
    'open_full',
    'period_locking',
    'period_open',
    'period_closed',
    'ahead_join',
    'period_exiting'
  ];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (_.get(conf.parsePlanStatus(id), 'code') === item) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};
/**
 * parseLoanStatus
 */
exports.parseLoanStatus = function(id) {
  var ret = {};
  var keys = [
    'open',
    'ready',
    'failed',
    'in_progress',
    'over_due',
    'bad_debt',
    'closed',
    'first_apply',
    'first_ready',
    'pre_sales',
    'wait_open',
    'fangbiao_processing',
    'liubiao_processing'
  ];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (_.get(conf.parseLoanStatus(id), 'code') === item) {
      //if(_.get(conf.parseLoanStatus(id), 'code') === item){
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};

/**
 * plan，loan，Buy confirm code
 */
exports.parseProductErrorCode = function(id) {
  var ret = {};
  var keys = [
    'amount_short',
    'sale_finish',
    'not_security_certificate',
    'debt_processed',
    'charge_processed'
  ];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (_.get(conf.parseProductBuyStatus(id), 'code') === item) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};

/*transfer status*/
exports.parseTransferStatus = function(id) {
  var ret = {};
  var keys = [
    'transfering',
    'transfered',
    'cancle',
    'closed_cancle',
    'overdue_cancle',
    'presale'
  ];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (id === item) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};

/*coupon type*/
exports.parseCouponStatus = function(id) {
  var ret = {};
  var keys = ['discount', 'money_off'];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (id === item) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};

/*escrow count out of 3*/
exports.ESCROW_BEYOND_COUNT_CODE = 5068;

/*use coupon product*/
exports.parseCouponUsedProduct = function(id) {
  var arr = id.split(',');
  var regExp = /^F(\d+)$/;
  var data = {
    plan: false,
    loan: false,
    loan_transfer: false,
    planDetail: []
  };
  arr.forEach(function(elem) {
    if (elem == 'LOAN') {
      data.loan = true;
    } else if (elem == 'LOAN_TRANSFER') {
      data.loan_transfer = true;
    } else if (elem == 'FALL') {
      data.plan = true;
    } else if (elem.match(regExp)) {
      data.planDetail.push(elem.match(regExp)[1]);
    }
  });
  return data;
};

/* coupon state */
exports.parseCouponState = function(id) {
  var ret = {};
  var keys = ['available', 'used', 'disabled'];
  keys.forEach(function(k) {
    var item = k.toUpperCase();
    if (id == item) {
      ret[k] = true;
    } else {
      ret[k] = false;
    }
  });
  return ret;
};

// 是否展示邀请好友
exports.disabledDisplayInvite = function(userInfo = {}) {
  //销售身份禁用邀请，销售顾问是卓越事业部禁用邀请
  return userInfo.isSales || !userInfo.isDisplayInvite;
};

// 散标借款详情描述
exports.loanDetailDescription = function(info = {}) {
  const {
    companyProvince = '--',
    companyLocation = '--',
    gender,
    age,
    amount = '--',
    title = '--',
    companyPost
  } = info;
  // 是否是私营业主
  const isPrivateBusinessOwner =
    companyPost.includes('股东') || companyPost.includes('法人');
  // 性别
  function GenderText(model = '') {
    const gender = {
      MALE: '男',
      FEMALE: '女'
    };
    return gender[model] || '--';
  }
  // 身份划分
  function identityType(isPrivateBusinessOwner) {
    return isPrivateBusinessOwner ? '私营业主' : '工薪人群';
  }
  // 收入类别
  function incomeType(isPrivateBusinessOwner) {
    return isPrivateBusinessOwner ? '经营收入' : '薪资收入';
  }
  return `借款人常住${companyProvince}，${companyLocation}，${GenderText(
    gender
  )}，${age}岁，${identityType(
    isPrivateBusinessOwner
  )}，已通过红小宝平台信用审查。现申请借款${amount}元用于${title}，主要以${incomeType(
    isPrivateBusinessOwner
  )}为还款来源。`;
};

exports.availableRaise = item => {
  const now = Date.now();
  const start = item.start - 0 || 0;
  const end = item.end - 0 || 0;
  // 在有效期
  if (start < now && (!end || now < end)) {
    return item;
  }
};

/**
 * 身份证校验
 *
 * @see http://www.cnblogs.com/lzrabbit/archive/2011/10/23/2221643.html
 * @param {string} id code
 * @returns {Boolean} Returns `Boolean` of id code
 */
exports.isIdentityCode = function isIdentityCode(code) {
  var city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外'
  };
  var tip = '';
  var pass = true;

  if (
    !code ||
    !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)?$/i.test(
      code
    )
  ) {
    tip = '身份证号格式错误';
    pass = false;
  } else if (!city[code.substr(0, 2)]) {
    tip = '地址编码错误';
    pass = false;
  } else {
    //18位身份证需要验证最后一位校验位
    if (code.length === 18) {
      code = code.split('');
      //∑(ai×Wi)(mod 11)
      //加权因子
      var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      //校验位
      var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      var ai = 0;
      var wi = 0;
      for (var i = 0; i < 17; i++) {
        ai = code[i];
        wi = factor[i];
        sum += ai * wi;
      }
      var last = parity[sum % 11];
      if (last.toString() !== code[17].toString().toUpperCase()) {
        tip = '校验位错误';
        pass = false;
        logger.debug('校验位错误', last, code[17]);
      }
    } else {
      pass = false;
    }
  }
  if (!pass) {
    logger.debug('identityCode', tip);
  }
  return pass;
};

/**
 * 标的认证状态
 *
 * @param {string} check Status Str of loan eg: 'IDENTIFICATION_SCANNING CREDIT WORK INCOME_DUTY 其他认证'
 * @returns {Object} Returns `Object` {'IDENTIFICATION_SCANNING': true, 'CREDIT': true, 'WORK': true, 'INCOME_DUTY': true, 'fifthStatus': '其他认证'}
 */
exports.parseLoanDetailCheckStatus = function parseLoanDetailCheckStatus(
  checkStatusStr
) {
  const defaultStatus = new Set([
    'IDENTIFICATION_SCANNING',
    'CREDIT',
    'WORK',
    'INCOME_DUTY'
  ]);
  var praseRet = {};
  var checkStatusArr = checkStatusStr.split(',').map(item => item.trim());
  checkStatusArr.forEach(function(key) {
    if (defaultStatus.has(key)) {
      praseRet[key] = true;
    } else {
      praseRet['fifthStatus'] = key;
    }
  });
  return praseRet;
};

/**
 * 红利智投 extend Lock Period
 *
 * @param {number} [period=0] period of plan
 * @param {string|'INVERT'|'HXB'} [type='INVERT'] income treatment of plan
 * @returns {Object} Returns `Object` {'month': '3-5', 'period': '短期'}
 */
exports.extendLockPeriod = function extendLockPeriod(
  period,
  cashType = INCOME_TREATMENT.INVEST
) {
  var month;
  var periodText;
  period = period - 0 || 0;

  if (3 <= period && period < 6) {
    month = '3-5';
    periodText = '短期';
  } else if (6 <= period && period < 12) {
    month = '6-11';
    periodText = '中期';
  } else if (12 <= period && period < 24) {
    month = '12-23';
    periodText = '中长期';
  } else if (24 <= period) {
    month = '24-36';
    periodText = '长期';
  } else {
    month = period;
    periodText = '短期';
  }

  // 收益提取的计划
  if (cashType === INCOME_TREATMENT.CASH && 12 <= period && period < 36) {
    month = '12-36';
    periodText = '中长期';
  }

  return {
    month: month,
    period: periodText
  };
};
