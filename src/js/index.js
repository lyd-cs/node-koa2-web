'use strict';

if (window['app']) {
  return $.error('app has been loaded!');
}
require('../bower_components/bootstrap-stylus/js/transition.js');
require('../bower_components/bootstrap-stylus/js/tab.js');
require('../bower_components/bootstrap-stylus/js/carousel.js');
require('../bower_components/bootstrap-stylus/js/tooltip.js');
require('../bower_components/bootstrap-stylus/js/popover.js');
require('../bower_components/bootstrap-stylus/js/modal.js');
require('./customValidate');
require('../lib/jquery.wrapper.countdown.js');

var app;
var util = require('./util');
var handlerHome = require('./home.js');
var handlerHeartBeat = require('./heartBeat.js');
var handlerLoanDetail = require('./loan.detail.js');
var handlerPlanDetail = require('./plan.detail.js');
var handlerAboutJobs = require('./about.jobs.js');
var handlerAboutContact = require('./about.contact.js');
var chartProgress = require('./chartProgress');
var handlerSignup = require('./user.signup.js');
var handlerSignupRealname = require('./user.signup.realname.js');
var handlerLoginForgotStep = require('./login.forgot.step.js');
var handlerUserLogin = require('./user.login.js');
var handlerCreateAccount = require('./depository.account.js');
var handlerAccountLoan = require('./account.loan.js');
var handlerAccountPlan = require('./account.plan.js');
var handlerAccountSetting = require('./account.setting.js');
var handlerAccountHome = require('./account.home.js');
var handlerAccountMessage = require('./account.message.js');
var handlerAccountWithDraw = require('./account.withdraw.js');
var handlerAccountRiskvail = require('./account.riskvail.js');
var handlerAccountRecharge = require('./account.recharge.js');
var handlerAccountTradPassword = require('./account.trad.password.js');
var handlerAccountEditMobile = require('./account.edit.mobile.js');
var handlerAccountNewMobile = require('./account.new.mobile.js');
var handlerAccountSecure = require('./account.secure.js');
var handlerAccountEditPassword = require('./account.edit.password.js');
var handlerPlanList = require('./plan.list');
var handlerAccountGatewayCharge = require('./account.gateway.charge.js');
var handlerBackTopAction = require('./backtop.js');
var handlerGuideProfit = require('./guide.js');
var handlerTransferDetail = require('./transfer.detail.js');
var handlerAccountListDropdown = require('./account.list.dropdown.js');
var handlerAccountTransfer = require('./account.transfer.js');
var handlerAccountBankAdd = require('./account.bank.add.js');
var handlerAccountQuickpay = require('./account.quickpay.js');
var handlerAccountSelectBank = require('./account.select.bank.js');
var handlerModalShow = require('./invest.btn.js');
var handlerSettingInviteCode = require('./account.invite.code.js');
var handlerProductBuy = require('./product.buy.ajax.js');
var handlerAccountWithdrawList = require('./account.withdraw.list.js');
var handlerAccountCoupon = require('./account.coupon.js');
var handlerExchangeCoupon = require('./exchange.coupon.js');
var handlerSelectCoupon = require('./coupon.select.js');
var handlerAccountUnbind = require('./account.unbind.js');
var handlerHelpQuestion = require('./help.js');
var handlerSaleModalShow = require('./sale.modal.js');
var handlerInviteList = require('./account.invite.js');
var handlerAccountShare = require('./account.share.js');
var handlerAboutCompany = require('./about.company.js');
var handlerEnterpriseRecharge = require('./enterprise.js');
var handlerAccountPlanDetail = require('./account.plan.detail.js');
var handlerAccountPlanExit = require('./account.plan.exit.js');
var handlerAccountPlanJoinExit = require('./account.plan.join.exit.js');
var handlerNovice = require('./landing.novice.js');

function initDatePicker() {
  $.fn.datepicker.defaults.format = 'yyyy-mm-dd';
  $.fn.datepicker.defaults.language = 'zh-CN';
  $.fn.datepicker.defaults.todayBtn = true;
  $.fn.datepicker.defaults.todayHighlight = true;
}
// shim for ie
function polyfill() {
  if (!Date.now) {
    Date.now = function() {
      return (new Date()).getTime();
    };
  }
}

app = {
  // Make sure that every Ajax request sends the CSRF token
  CSRFProtection: function(xhr) {
    var token = $('meta[name="csrf-token"]').attr('content');
    if (token) xhr.setRequestHeader('X-CSRF-Token', token);
  },
  refreshCSRFTokens: function() {
    var csrfToken = $('meta[name=csrf-token]').attr('content');
    var csrfParam = $('meta[name=csrf-param]').attr('content');
    $('form input[name="' + csrfParam + '"]').val(csrfToken);
  },
  attachCSRF: function() {
    //console.log('app.attachCSRF');
    var me = this;
    $.ajaxPrefilter(function(options, originalOptions, xhr) {
      if (!options.crossDomain) {
        me.CSRFProtection(xhr);
      }
    });
    me.refreshCSRFTokens();
    return me;
  },
  home: handlerHome,
  heartBeat: handlerHeartBeat,
  loanDetail: handlerLoanDetail,
  planList: handlerPlanList,
  PlanDetail: handlerPlanDetail,
  aboutJobs: handlerAboutJobs,
  aboutContact: handlerAboutContact,
  userSignup: handlerSignup,
  userSignupRealname: handlerSignupRealname,
  loginForgotStep: handlerLoginForgotStep,
  userLogin: handlerUserLogin,
  createAccount: handlerCreateAccount,
  util: util,
  chartProgress: chartProgress,
  accountLoan: handlerAccountLoan,
  accountPlan: handlerAccountPlan,
  accountSetting: handlerAccountSetting,
  accountRiskvail: handlerAccountRiskvail,
  accountHome: handlerAccountHome,
  accountMessage: handlerAccountMessage,
  withdraw: handlerAccountWithDraw,
  recharge: handlerAccountRecharge,
  accountEditTradPwd: handlerAccountTradPassword,
  accountEditMobile: handlerAccountEditMobile,
  accountNewMobile: handlerAccountNewMobile,
  accountSecure: handlerAccountSecure,
  accountEditPwd: handlerAccountEditPassword,
  accountGatewayCharge: handlerAccountGatewayCharge,
  backTopAction: handlerBackTopAction,
  transferDetail: handlerTransferDetail,
  accountListDropdown: handlerAccountListDropdown,
  accountTransfer: handlerAccountTransfer,
  guideProfit: handlerGuideProfit,
  accountBankAdd: handlerAccountBankAdd,
  quickPay: handlerAccountQuickpay,
  accountSelectBank: handlerAccountSelectBank,
  modalShow: handlerModalShow,
  settingInviteCode: handlerSettingInviteCode,
  productBuy: handlerProductBuy,
  accountWithdrawList: handlerAccountWithdrawList,
  accountCoupon: handlerAccountCoupon,
  exchangeCoupon: handlerExchangeCoupon,
  selectCoupon: handlerSelectCoupon,
  accountUnbind:handlerAccountUnbind,
  helpQuestion: handlerHelpQuestion,
  saleModalShow: handlerSaleModalShow,
  accountInviteList: handlerInviteList,
  accountShare: handlerAccountShare,
  aboutCompany: handlerAboutCompany,
  enterpriseRecharge: handlerEnterpriseRecharge,
  accountPlanDetail: handlerAccountPlanDetail,
  accountPlanExit: handlerAccountPlanExit,
  accountPlanJoinExit: handlerAccountPlanJoinExit,
  novice: handlerNovice,
  init: function(){
    var me = this;
    polyfill();
    me.attachCSRF();
    me.heartBeat();
    return me;
  }
};

// app init
app.init();

// assgin to window
window['app'] = app;

// dom ready
$(function() {
  initDatePicker();
  $('body').popover({
    delay: {'show': 100, 'hide': 300},
    trigger: 'hover',
    selector: '[data-toggle="popover"]',
    html: true
  });
  $('.J_datepicker').datepicker({
    format: 'yyyy-mm-dd',
    autoclose: true
  });
  $('.J_numValidate').on('keyup', function(e) {
    var that = $(this);
    var currKey = 0, e = e || event;
    currKey = e.keyCode || e.which || e.charCode;
    if (currKey < 48 || currKey > 57) {
      that.val(that.val().replace(/[^(1-9!0)\d + x|X]/g, ''));
      e.returnValue = false;
    }
  });
  $('.J_countdown').countdown({
    onEnd: function() {
      location.reload();
    },
    render: function(date) {
      var ret = [];
      var ele = $(this.el);
      var _add = function(str, flag) {
        return ret.push(['<span class="num">', str, '</span>', flag].join(''));
      };
      var _render = function() {
        var str = ret.join('');
        var key = 'countdown_cache';
        var cache = ele.data(key);
        if (cache && cache.length == str.length && cache == str) {
          return;
        }
        return ele.data(key, str).html(str);
      };
      // for 60 sec
      if (date.sec == 60) {
        date.min += 1;
        date.sec = 0;
      }
      if (date.days > 0) {
        _add(this.leadingZeros(date.days, 2), '天');
        _add(this.leadingZeros(date.hours, 2), '小时');
      } else if (date.days == 0 && date.hours > 0) {
        _add(this.leadingZeros(date.hours, 2), '小时');
        _add(this.leadingZeros(date.min, 2), '分');
      } else {
        _add(this.leadingZeros(date.min, 2), '分');
        _add(this.leadingZeros(date.sec, 2), '秒');
      }
      return _render();
    }
  });
  app.chartProgress();
});
exports = module.exports = app;
