'use strict';
var util = require('./util');
var ErrMsg = util.ErrMsg;
var modal_tpl = require('./tpl/modal.riskvail.pug');
var _tpl_loading = require('./tpl/loading.pug');

var option;
var defaultOption = {
  form: '#J_buy-form'
};
var apiUrl = {
  '#user_order': '/api/plan/joinRecord'
};
var planTabHash = {
  '#refund': '#J_refund-list'
};

var planDetail = {
  profitFlag: 0,
  tabSend: function(apiUrl, el, dataTarget) {
    var tabContent = $(dataTarget);
    tabContent.html(_tpl_loading);
    $.post(apiUrl, { 'id': option.planId })
      .done(function(val) {
        if (!val) {
          tabContent.html('暂无数据返回');
          return;
        }
        if (val.status !== 0) {
          tabContent.html('暂无数据返回');
          return;
        }
        tabContent.html(val.data.html);
        el.attr('data-init', '1');
      });
  },
  tabNav: function() {
    var me = this;
    $('#plan-tab-nav a').on('click', function() {
      var item = $(this);
      var dataTarget = item.data('target');
      var _apiUrl = apiUrl[dataTarget];
      if (item.attr('data-init') === '1' || !_apiUrl) return;
      me.tabSend(_apiUrl, item, dataTarget);
    });
  },
  handleHash: function() {
    var reqHash = window.location.hash;
    if (!reqHash) return;
    $(planTabHash[reqHash]).trigger('click');
  },
  profitInput: function(val) {
    $('#J_earnings_tips').text(util.toFixed(val / 100 * (option.eachProfit + option.subsidyEachProfit), 2));
  },
  guardHandle: function() {
    var data = {
      score: 0
    };
    $.post('/api/riskGuard', data)
      .done(function(data) {
        if (data.status != 0) {
          $('#J_guard-err').html(data.message);
          return;
        }
        $('.modal').modal('hide');
        option.isRisk = true;
        $('.btn-buy-submit').trigger('click');
      });
  },
  profitInputError: function(place) {
    $('#J_ipt').addClass('error');
    $('.product-buy-validate').empty()
      .removeClass('success-msg info-msg')
      .addClass('error-msg')
      .append(place);
  },
  profitInputSuccess: function(place) {
    $('#J_ipt').removeClass('error');
    $('.product-buy-validate').empty().removeClass('error-msg').addClass('success-msg info-msg').append(place);
  },
  profitValidate: function(e) {
    var me = this;
    var _val = $('#J_ipt').val();
    var inputVal = Number(_val);
    var isFirstBuy = option.isFirstBuy;
    var singleMaxJoin = option.singleJoin;
    var planResidualInvest = option.remainAmount;
    var minInvestAmount = isFirstBuy ? option.minAmount : option.increasingInvest;
    var planIncreasingInvest = option.increasingInvest;
    var userResidualInvest = option.userRemainInvest;
    var userMaxInvest = isFirstBuy ? singleMaxJoin : userResidualInvest;
    var isMultiple = isFirstBuy ? ((inputVal - minInvestAmount) / planIncreasingInvest) : (inputVal / planIncreasingInvest);
    var enableBuy = userMaxInvest > planResidualInvest ? planResidualInvest : userMaxInvest;
    var noviceLeftInvest = option.newbiePlanLeftAmount;
    var isPlanNovice = option.isPlanNovice;
    var isLogin = option.isLogin;

    if (_val == '') {
      me.profitFlag = 0;
      if (e.which !== 13) me.profitInputSuccess();
      return false;
    }
    if (enableBuy <= minInvestAmount && inputVal !== enableBuy) {
      me.profitFlag = 0;
      me.profitInputError('当前加入金额须为' + enableBuy + '元');
      return false;
    }
    if (isNaN(_val)) {
      me.profitFlag = 0;
      me.profitInputError(ErrMsg.isNumber);
      return false;
    }
    if (enableBuy > minInvestAmount && (inputVal < minInvestAmount || (isMultiple !== parseInt(isMultiple)))) {
      me.profitFlag = 0;
      me.profitInputError(minInvestAmount + '元起投,' + planIncreasingInvest + '元递增');
      return false;
    }
    if (isLogin) {
      if (inputVal > enableBuy) {
        me.profitFlag = 0;
        me.profitInputError('本期可加入上限' + enableBuy + '元');
        return false;
      }
      if(isPlanNovice && (inputVal > noviceLeftInvest)){
        me.profitFlag = 0;
        me.profitInputError('购买金额大于新手产品剩余可购买金额');
        return false;
      }
    }
    me.profitFlag = 1;
    me.profitInputSuccess();
  },
  formValidate: function(e) {
    var me = this;
    var isLogin = option.isLogin;
    var isRisk = option.isRisk;
    var inputVal = Number($('#J_ipt').val());
    var planResidualInvest = option.remainAmount;
    var userMaxInvest = option.isFirstBuy ? option.singleJoin : option.userRemainInvest;
    var minInvestAmount = option.isFirstBuy ? option.minAmount : option.increasingInvest;
    var modalShow = function(modalId) {
      var $modal = $(modal_tpl({
        modalBoxId: modalId
      }));
      $modal.appendTo('#J_plan-detail-realname-modal').modal('show');
      $('#J_guard').on('click', function(event) {
        event.preventDefault();
        me.guardHandle();
      });
      $('#J_cancle').on('click', function() {
        $('.modal').modal('hide');
      });
    };
    if (isLogin) {
      if (!isRisk) {
        var modalId = 1;
        modalShow(modalId);
        e.preventDefault();
        return false;
      }
      if (inputVal == '') {
        me.profitFlag = 0;
        me.profitInputError(ErrMsg.isAmount);
        e.preventDefault();
        return false;
      }
      if (userMaxInvest < planResidualInvest && planResidualInvest < minInvestAmount) {
        me.profitFlag = 0;
        me.profitInputError(ErrMsg.isInsufficientAllowance);
        e.preventDefault();
        return false;
      }
      if (!me.profitFlag) {
        e.preventDefault();
        return false;
      }
    }
    me.profitInputSuccess();
  },
  profitInputValidate: function() {
    var me = this;
    var $investInput = $('#J_ipt');
    var planResidualInvest = option.remainAmount;
    var minInvestAmount = option.isFirstBuy ? option.minAmount : option.increasingInvest;
    if (planResidualInvest <= minInvestAmount) {
      $investInput.prop('readOnly', true).val(planResidualInvest);
      me.profitFlag = 1;
      me.profitInput($investInput.val());
      me.expectedProfit($investInput.val());
    }
    $investInput.on('keyup keydown', function(e){
      var keynum;
      if(window.event){
        keynum = e.keyCode;
      }else if(e.which){
        keynum = e.which;
      }
      if(keynum == 32){
        return false;
      }
    });
    $investInput.on('keyup', function(e) {
      var _val = $(this).val();
      // if (/\D|(^0+)/.test(_val)) {
      //   var newVal = _val.replace(/\D|(^0+)/g, '');
      //   $(this).val(newVal);
      // }
      // me.profitInput(_val);
      me.profitValidate(e);
      me.profitInput(_val);
      me.expectedProfit(_val);

    });
  },
  joinSubmit: function() {
    var me = this;
    $('#J_buy-form').on('submit', function(e) {
      if (e.result !== false){
        me.formValidate(e);
      }
    });
  },
  iconSwitch: function(val){
    if(val){
      $('.J_icon-question-circle').removeClass('hide').addClass('active');
    }else{
      $('.J_icon-question-circle').removeClass('active').addClass('hide');
    }

  },
  expectedProfit: function(val){
    var me = this;
    if(val > 0){
      me.iconSwitch(val);
    }
    $('.J_icon-question-circle').attr('data-content', '加息部分'+util.toFixed(option.subsidyEachProfit/100*val, 2)+'元将在计划退出时返还至您的账户。');

  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    me.iconSwitch();
    me.profitInputValidate();
    me.joinSubmit();
    me.tabNav();
    me.handleHash();
    me._init = true;
    return me;
  }
};

exports = module.exports = planDetail;