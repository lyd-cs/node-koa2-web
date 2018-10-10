
'use strict';

var _tpl_error = require('./tpl/error.pug');
var _tpl_ajaxLoading = require('./tpl/buy.ajax.loading.pug');
var _tpl_pay_amount = require('./tpl/buy.confirm.pay.pug');
var exchange_coupon = require('./tpl/coupon.exchange.pug');
var _tpl_modal_charge = require('./tpl/modal.buy.charge.pug');
var util = require('./util');
var _wrap = $('#J_content');
var Form = util.Form;
var ErrMsg = util.ErrMsg;
var ajaxUrl = {
  plan: '/api/plan/buy',
  loan: '/api/loan/buy',
  transfer: '/api/transfer/buy'
};

var $modal;
var $el = {};
var defaultOption = {
  form: '#J_buy-form'
};

var option;
var _userCharge;
var _timer;
var _count = 0;
var defCount = 60;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $(option.smscode).prop('disabled', true).text(_title);
  // $('#J_voice-verifycode').parent().hide();
};
function enbaleVerify(){
  _count = 0;
  clearTimeout(_timer);
  $(option.smscode).prop('disabled', false).text($el.smscode.data('origin'));
};
function countDown(){
  disableVerify();
  if ( _count <=0 ) {
    enbaleVerify();
    // $('#J_voice-verifycode').attr('disabled', false).parent().removeClass('voice-gray').show();
    // $('.J_phone-voice').hide();
    // $('.J_phone-number').hide();
  }
  _count--;
};
function startCountDown(){
  _count = defCount;
  countDown();
  _timer = setInterval(function(){
    countDown();
  }, 1000);
};
function buyAddErr(err){
  $('.error-info').html(err);
  $('.error').empty();
};
var productBuy = {
  bindValidate: function(form){
    var opt;
    var me =this;
    if ( !form || form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      onkeyup: false,
      rules:{
        password: {
          required: true,
          maxlength: 6,
          minlength: 6,
          isTradPwd: true,
        },
        smsCode: {
          required: true,
          maxlength: 6,
          minlength: 6
        },
      },
      messages:{
        password: {
          required: ErrMsg.isEmptyTradPwd,
          isTradPwd: ErrMsg.isFormatTradPwd,
          maxlength: ErrMsg.lenTradPwd,
          minlength: ErrMsg.lenTradPwd
        },
        smsCode:{
          required: ErrMsg.isEmptySmsCode,
          minlength: ErrMsg.lenSmsCode,
          maxlength: ErrMsg.lenSmsCode
        },
      },
      showErrors: function() {
        $('.error-info').empty();
        this.defaultShowErrors();
      },
      success: function(msg, el){
        var parent = $(el).parents('.form-group');
        var holder = $('.help-inline', parent);
        if(!holder.length){
          holder = $('<div class="help-inline"></div>').appendTo(parent);
        }
        holder.empty().removeClass('error-msg info-msg');
        $('span', holder).remove();
      },
      submitHandler: function(){
        me.formSubmit();
      }
    });
    $(form).validate(opt);
    form._bindValidate = true;
  },
  checkboxChecked: function(){
    $('#J_protocol-checkbox').on('change', function(){
      var temp = $('#J_protocol-checkbox').is(':checked');
      if(!temp){
        $('#J_btn-buy-confirm').prop('disabled', true);
        return false;
      }
      $('#J_btn-buy-confirm').prop('disabled', false);
    });
  },
  chooseHandler: function(){
    var _data;
    var _couponId;
    $('.J_coupon-list').on('click', '.J_coupon-item', function(){
      var couponMessage = $(this).html();
      var currentCoupon = $(this);
      var $couponList = $('.J_coupon-more-list');
      if (!$(this).data('disabled')){
        return;
      }
      _couponId = $(this).data('id');
      _data = {
        couponId: _couponId,
        amountStr: option.buyResultBidAmount
      };
      $.post('/api/choose/coupon', _data)
        .done(function(json){
          if (json.status !== 0){
            return;
          }
          var payable = json.data.payable - 0 || 0;
          $('#J_pay-amount').html(_tpl_pay_amount({
            formData: option,
            payable: payable,
            formatNumber: util.formatNumber
          }));
          _userCharge = payable - option.userAvailableBalance;
          $('#J_content').find('.J_coupon-more').removeClass('hide');
          $('.J_pay-amount').html(util.formatNumber(payable, 2));
          $('.J_coupon-default').html(couponMessage);
          $('.J_more-coupon').find('i').remove();
          $('.J_more-coupon').append('<i class="fa fa-angle-down"></i>');
          $('input[name=couponId]').val(_couponId);
          $couponList.addClass('hide');
          currentCoupon.addClass('coupon-active').siblings().removeClass('coupon-active');
        });
    });
  },
  smsCode: function(){
    var _btn = option.verifycode;
    var _form = option.form;
    var _data = {};
    var _disableSubmit = function(msg){
      if ( msg ) {
        buyAddErr(msg);
      }
    };
    //var _amount = $('#J_smscode').data('amount');
    // _data = {
    //   amount: _userCharge,
    // };

    $(_form).on('click', _btn, function(){
      var present = $(this).data('action');
      var $modal = $(_tpl_modal_charge({action: present =='smscode'?'smscode':'voice'}));
      var sendUrl = present =='smscode'?'/api/smscode/quickpay':'/api/smscode/quickpayvoice';
      $modal.appendTo($('#J_content'));
      _data = {
        amount: _userCharge,
        type: 'RECHARGE'
      };
      if(_userCharge < 1){
        $modal.modal();
        return;
      }
      $.post(sendUrl, _data)
      .done(function(json){
        if(json.status !== 0){
          _disableSubmit(json.message);
          return false;
        }
        if (present =='smscode') {
          $('.J_phone-number').show();
        }else{
          $('.J_phone-voice').show();
        }
        $('.error-info').empty();
        startCountDown();
      });
    });
    $('#J_content').on('click', '#J_sendcode', function(){
      var action = $(this).data('init');
      var sendUrl = action == 'smscode'?'/api/smscode/quickpay':'/api/smscode/quickpayvoice';
      _data = {
        amount: _userCharge,
        type: 'RECHARGE'
      };
      $('#J_content #J_send_modal').modal('hide');
      $.post(sendUrl, _data)
      .done(function(json){
        if(json.status !== 0){
          _disableSubmit(json.message);
          return false;
        }
        if (action == 'smscode') {
          $('.J_phone-number').show();
        }else {
          $('.J_phone-voice').show();
        }
        $('.error-info').empty();
        startCountDown();
      });
    });
  },
  toggleBtnState: function(btn){
    if(!btn.prop('disabled')){
      btn.addClass('loading-status');
      btn.prop('disabled', true);
      return;
    }
    btn.prop('disabled', false);
    btn.removeClass('loading-status');
  },
  formSubmit: function(){
    var me = this;
    var _btn = $('#J_btn-buy-confirm');
    var _url = _btn.data('type');
    var _formData =  $('#J_buy-form').serialize();
    var _riskWarn = $('#J_adventure-checkbox');
    if (option.hasRiskWarn && !_riskWarn.is(':checked')){
      buyAddErr(ErrMsg.riskWarn);
      return;
    }
    me.toggleBtnState(_btn);
    $.post(ajaxUrl[_url], _formData).done(function(json){
      if(json.status !== 0){
        if(json.data){
          buyAddErr(_tpl_error({errors : json.data}));
        }
        else{
          buyAddErr(json.message);
        }
        me.toggleBtnState(_btn);
        return;
      }
      _wrap.addClass('buy-result').html(_tpl_ajaxLoading());
      setTimeout(function(){
        _wrap.find('#J_result-wrap').html(json.data.html);
      }, 1500);
    });
  },
  moreCouponShow: function(){
    $('#J_content').on('click', '.J_more-coupon', function(){
      var $couponList = $('#J_content').find('.J_coupon-more-list');
      // $('.J_coupon-more-item').toggle();
      if ($couponList.hasClass('hide')) {
        $couponList.removeClass('hide');
        $(this).find('i').remove();
        $(this).append('<i class="fa fa-angle-up"></i>');
      } else {
        $couponList.addClass('hide');
        $(this).find('i').remove();
        $(this).append('<i class="fa fa-angle-down"></i>');
      }
    });
  },

  renderExchangeModal: function(){
    $modal = $(exchange_coupon());
    $modal.appendTo(document.body);
  },
  bindExchange: function(){
    var me = this;
    $('.J_coupon-exchange').on('click', function(){
      if ($modal){
        $modal.modal('show');
        return;
      }
      me.renderExchangeModal();
      $modal.modal('show');
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'smscode', 'verifycode'], function(k, v){
      $el[v] = $(option[v]);
    });
    _userCharge = option.userCharge;
    me.bindValidate($el.form);
    me.smsCode();
    me.checkboxChecked();
    me.chooseHandler();
    me.renderExchangeModal();
    me.bindExchange();
    me.moreCouponShow();
  }
};

exports = module.exports = productBuy;