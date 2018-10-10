/**
 * proxy
 */
var QueryString = require('querystring');

var co = require('co');
var request = require('co-request');
const util = require('../lib/util');

const {
  _,
  config,
  uuid,
} = util;

var API_BASE = config.apiBase;
var isConsole = config.console;

var rquery = (/\?/);

var CONF = {
  'getTest': {
    uri: 'http://httpbin.org/get',
    method: 'get'
  },
  'listPost': {
    uri: 'http://httpbin.org/post',
    method: 'post'
  },
  'planList': {
    baseUrl: API_BASE,
    uri: '/financeplan/financeplanlist',
    method: 'get'
  },
  'loanList': {
    baseUrl: API_BASE,
    uri: '/lend/loanindex',
    method: 'get'
  },
  'loanDetail': {
    baseUrl: API_BASE,
    uri: '/lend/loandetail',
    method: 'get'
  },
  'userAssets': {
    baseUrl: API_BASE,
    uri: '/account/userpoint',
    method: 'post'
  },
  'loanConfirm': {
    baseUrl: API_BASE,
    uri: '/lend/loanlenderconfirm',
    method: 'post'
  },
  'loanBuyResult': {
    baseUrl: API_BASE,
    uri: '/lend/loanlender',
    method: 'post'
  },
  'loanInvestRecord': {
    baseUrl: API_BASE,
    uri: '/lend/loanlenderallrecord',
    methed: 'post'
  },
  'loanRefundPlan': {
    baseUrl: API_BASE,
    uri: '/lend/borrowRepayRecord',
    method: 'post'
  },
  'planListRecommend': {
    baseUrl: API_BASE,
    uri: '/financeplan/queryForIndexUplanListNew',
    method: 'get'
  },
  'planDetail': {
    baseUrl: API_BASE,
    uri: '/financeplan/financeplandetail',
    method: 'get'
  },
  'planConfirm': {
    baseUrl: API_BASE,
    uri: '/financeplan/toRegisterfinanceplan',
    method: 'post'
  },
  'planBuyResult': {
    baseUrl: API_BASE,
    uri: '/financeplan/registerfinanceplan',
    method: 'post'
  },
  'getProductJoinRecord': {
    baseUrl: API_BASE,
    uri: '/financeplan/financeplanalllenders',
    method: 'post'
  },
  'getCaptcha': {
    baseUrl: API_BASE,
    uri: '/login/genrandcode',
    method: 'post'
  },
  'sendValidateCode': {
    baseUrl: API_BASE,
    uri: '/login/gensmscode',
    method: 'post'
  },
  'checkSmsCode': {
    baseUrl: API_BASE,
    uri: '/login/validateSmsCode',
    method: 'post'
  },
  'userCheckMobile': {
    baseUrl: API_BASE,
    uri: '/login/checkRepeatMobile',
    method: 'post'
  },
  'userSignupPost': {
    baseUrl: API_BASE,
    uri: '/login/register',
    method: 'post'
  },
  'userLoginPost': {
    baseUrl: API_BASE,
    uri: '/login/authentication',
    method: 'post'
  },
  'userForgotPost': {
    baseUrl: API_BASE,
    uri: '/login/reset_password',
    method: 'post'
  },
  'accountLoanList': {
    baseUrl: API_BASE,
    uri: '/account/userloanlist',
    method: 'get'
  },
  'accountLoanAsset': {
    baseUrl: API_BASE,
    uri: '/account/userloanstatis',
    method: 'post'
  },
  'accountLoanIntranst': {
    baseUrl: API_BASE,
    uri: '/loantransfer/getTransferByUser',
    method: 'post'
  },
  'accountPlanAsset': {
    baseUrl: API_BASE,
    uri: '/account/userplanAssets',
    method: 'get'
  },
  'accountPlanList': {
    baseUrl: API_BASE,
    uri: '/account/userfinanceplanlist',
    method: 'get'
  },
  'accountPlanDetail': {
    baseUrl: API_BASE,
    uri: '/financeplan/my_plan_detail',
    method: 'post'
  },
  'accountPlanInvestLoan': {
    baseUrl: API_BASE,
    uri: '/financeplan/userfinanceplanLoanlist',
    method: 'post'
  },
  'accountMessageList': {
    baseUrl: API_BASE,
    uri: '/index/inner_mail_list',
    method: 'post'
  },
  'accountMessageIsRead': {
    baseUrl: API_BASE,
    uri: '/index/mul_read',
    method: 'post'
  },
  'setSecureAuth': {
    baseUrl: API_BASE,
    uri: '/account/safetyCertificate',
    method: 'post'
  },
  'setUserRealName': {
    baseUrl: API_BASE,
    uri: '/account/authentication',
    method: 'post'
  },
  'setUserTradPwd': {
    baseUrl: API_BASE,
    uri: '/account/setCashPassword',
    method: 'post'
  },
  'getTradRecord': {
    baseUrl: API_BASE,
    uri: '/account/userpointlog',
    method: 'post'
  },
  'getAccountAssest': {
    baseUrl: API_BASE,
    uri: '/account/asset',
    method: 'post'
  },
  'accountChangePwd': {
    baseUrl: API_BASE,
    uri: '/account/changePassword',
    method: 'post'
  },
  'getUserEarn': {
    baseUrl: API_BASE,
    uri: '/account/getTotalEarnings',
    method: 'post'
  },
  'checkIdentityAuth': {
    baseUrl: API_BASE,
    uri: '/account/checkIdNO',
    method: 'post'
  },
  'accountResetTradPwd': {
    baseUrl: API_BASE,
    uri: '/account/reset_cash_password',
    method: 'post'
  },
  'accountEditMobile': {
    baseUrl: API_BASE,
    uri: '/account/updatebindmobile',
    method: 'post'
  },
  'accountRecharge': {
    baseUrl: API_BASE,
    uri: '/escrow/recharge/gatewayRechargeRequest',
    method: 'post'
  },
  'accountSettingInvite': {
    baseUrl: API_BASE,
    uri: '/account/addInvestCode',
    method: 'post'
  },
  'accountRechargeResultDeal': {
    baseUrl: API_BASE,
    uri: '/paycenter/getFuyouResponse',
    method: 'post'
  },
  'accountWithDraw': {
    baseUrl: API_BASE,
    uri: '/paycenter/applyForCash',
    method: 'post'
  },
  'accountWithdrawList': {
    baseUrl: API_BASE,
    uri: '/paycenter/getCashDrawLogs',
    method: 'post'
  },
  'accountWithdrawCount': {
    baseUrl: API_BASE,
    uri: '/paycenter/getCashDrawInprocessCount',
    method: 'post'
  },
  'accountWithDrawUserCard': {
    baseUrl: API_BASE,
    uri: '/escrow/recharge/getUserBank',
    method: 'post'
  },
  'accountBindCardAndPerfectInfo': {
    baseUrl: API_BASE,
    uri: '/account/accountEscrow',
    method: 'post'
  },
  'accountPlanAgreement': {
    baseUrl: API_BASE,
    uri: '/financeplan/myPlanServiceAgreement',
    method: 'post'
  },
  'accountSingleBindCard': {
    baseUrl: API_BASE,
    uri: '/account/singleBindCard',
    method: 'post'
  },
  'accountWithdrawTime': {
    baseUrl: API_BASE,
    uri: '/paycenter/getArrivalTime',
    method: 'post'
  },
  'accountLoanAgreement': {
    baseUrl: API_BASE,
    uri: '/lend/loanAgreement',
    method: 'post'
  },
  'accountLoanTransfer': {
    baseUrl: API_BASE,
    uri: '/loantransfer/startTransferPage',
    method: 'post'
  },
  'homePlanRecommend': {
    baseUrl: API_BASE,
    uri: '/financeplan/queryForIndexUplanListNewApp',
    method: 'get'
  },
  'accountRiskVail': {
    baseUrl: API_BASE,
    uri: '/account/riskEvaluation',
    method: 'post'
  },
  'checkLoginPwd': {
    baseUrl: API_BASE,
    uri: '/account/checkPassword',
    method: 'post'
  },
  'transferList': {
    baseUrl: API_BASE,
    uri: '/loantransfer/loanTransferList',
    method: 'get'
  },
  'transferDetail': {
    baseUrl: API_BASE,
    uri: '/loantransfer/getTransferDetail',
    method: 'post'
  },
  'transferAgreement': {
    baseUrl: API_BASE,
    uri: '/loantransfer/loanTransferAgreement',
    method: 'post'
  },
  'accountTransferResult': {
    baseUrl: API_BASE,
    uri: '/loantransfer/loanTransferStart',
    method: 'post'
  },
  'transferDebtList': {
    baseUrl: API_BASE,
    uri: '/loantransfer/loanLenderRecord',
    method: 'post'
  },
  'transferOrderList': {
    baseUrl: API_BASE,
    uri: '/loantransfer/getBuyTransferRecode',
    method: 'post'
  },
  'transferConfirm': {
    baseUrl: API_BASE,
    uri: '/loantransfer/buyTransPage',
    method: 'post'
  },
  'transferFinishDetail': {
    baseUrl: API_BASE,
    uri: '/loantransfer/finishTransDetail',
    method: 'post'
  },
  'transferRepayingDetail': {
    baseUrl: API_BASE,
    uri: '/loantransfer/repayingTransDetail',
    method: 'post'
  },
  'financeplanLoanOwner': {
    baseUrl: API_BASE,
    uri: '/financeplan/loanOwner',
    method: 'post'
  },
  'transferBuyResult': {
    baseUrl: API_BASE,
    uri: '/loantransfer/buyTransfer',
    method: 'post'
  },
  'quickPaySmsCode': {
    baseUrl: API_BASE,
    uri: '/escrow/recharge/getWithHoldMobileVerificationCode',
    method: 'post'
  },
  'withdrawSmsCode': {
    baseUrl: API_BASE,
    uri: '/paycenter/getCashDrawMobileVerificationCode',
    method: 'post'
  },
  'quickPay': {
    baseUrl: API_BASE,
    uri: '/escrow/recharge/fundActionWithHold',
    method: 'post'
  },
  'accountInviteCode': {
    baseUrl: API_BASE,
    uri: '/account/showInvestcodeInfo',
    method: 'post'
  },
  'createAccountBankCardCheck': {
    baseUrl: API_BASE,
    uri: '/account/queryCardBin',
    methos: 'post'
  },
  //coupon
  'accountExchangeCoupon': {
    baseUrl: API_BASE,
    uri: '/coupon/codeExchangeCoupon',
    method: 'post'
  },
  'accountCouponList': {
    baseUrl: API_BASE,
    uri: '/coupon/couponByUser',
    method: 'post'
  },
  'accountCouponUnused': {
    baseUrl: API_BASE,
    uri: '/coupon/availableCoupon',
    method: 'post'
  },
  'productGetPayAmount': {
    baseUrl: API_BASE,
    uri: '/coupon/getPayable',
    method: 'post'
  },
  'loanDebtRecord': {
    baseUrl: API_BASE,
    uri: '/lend/loanLenderRecord',
    method: 'post'
  },
  'loanTransferRecord': {
    baseUrl: API_BASE,
    uri: '/lend/getBuyTransferRecode',
    method: 'post'
  },
  'userLogout': {
    baseUrl: API_BASE,
    uri: '/logout',
    method: 'post'
  },
  'getWechatSignature': {
    baseUrl: API_BASE,
    uri: '/weixin/getSignature',
    method: 'post'
  },
  'verifyInviteCode': {
    baseUrl: API_BASE,
    uri: '/account/verifyInvestCode',
    method: 'post'
  },
  'wxQrcode': {
    baseUrl: API_BASE,
    uri: '/weixin/createQr',
    method: 'post'
  },
  'getVoiceSmscode': {
    baseUrl: API_BASE,
    uri: '/login/getAudioCode',
    method: 'post'
  },
  'inviteInfo': {
    baseUrl: API_BASE,
    uri: '/account/getInviteStatist',
    method: 'post'
  },
  'inviteList': {
    baseUrl: API_BASE,
    uri: '/account/getInviteInformation',
    method: 'post'
  },
  'getEmployeeId': {
    baseUrl: API_BASE,
    uri: '/account/getEmployeeId',
    method: 'post'
  }
};

var proxy = module.exports = function() {
  var args = _.slice(arguments);
  return co(function*() {
    var ret = yield request.apply(null, args);

    if (ret.statusCode === 200 && ret.body && ret.body.length) {
      return ret.body;
    }
    throw new Error(502, 'bad gateway');
  });
};

_.forEach(CONF, function(v, k) {
  proxy[k] = function(data, opt) {
    // default timeout for http
    var args = _.assign({ timeout: 10000 }, v);
    var cacheURL = args.uri || args.url;
    var form;
    var uri;
    var requestid;
    if(isConsole){
      console.log('proxy url', cacheURL);
    }
    if (args.method && (args.method === 'post' || args.method === 'put' || args.method === 'patch')) {
      requestid = uuid();
      if (data) {
        data._requestid = requestid;
        form = { form: data };
      }
      if (opt) {
        // application/x-www-form-urlencoded
        opt.form && (opt.form._requestid = requestid);
        // multipart/form-data
        opt.formData && (opt.formData._requestid = requestid);
      }
      console.log('[INFO] proxy - [%s] - %s', requestid, cacheURL, args.method);
      _.assign(args, form, opt);
    }
    if (!args.method || args.method === 'get') {
      uri = [cacheURL, (rquery.test(cacheURL)) ? '&' : '?', QueryString.stringify(data)].join('');
      _.assign(args, { uri: uri }, opt);
    }

    return proxy(args);
  };
});