/**
 * account withdraw
 */
'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_withdraw-form',
  smscode: '#J_verifycode',
  trigger: '#J_withdraw-btn'
};

var option;
var _timer;
var _count = 0;
var defCount = 60;
var isSubmiting = false;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $el.smscode.prop('disabled', true).text(_title);
  isSubmiting = true;
};
function enbaleVerify(){
  _count = 0;
  clearTimeout(_timer);
  $el.smscode.prop('disabled', false).text($el.smscode.data('origin'));
  isSubmiting = false;
};
function countDown(){
  disableVerify();
  if ( _count <=0 ) {
    enbaleVerify();
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

function bindValidate(form, options) {
  var opt;
  if (!form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    success: function(msg, el) {
      $(el).parent().siblings('.help-inline').empty();
    },
    submitHandler: function(form) {
      //showModal();
      $(option.trigger).attr('disabled', true);
      form.submit();
    },
    rules: {
      amount: {
        required: true,
        max: option.userBalance
      },
      smscode: {
        required: true
      }
    },
    messages: {
      amount: {
        required: ErrMsg.isEmptyAmount,
        max: ErrMsg.isAmountError
      },
      smscode: {
        required: ErrMsg.isEmptySmsCode
      }
    }
  });
  if (options) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountSetting = {
  bankCard: function() {
    $('#J_bankid').keyup(function() {
      var value = $(this).val().replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
      $(this).val(value);
    });
  },
  amount: function() {
    $('#J_withdraw-amount').keyup(function() {
      var value = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
      $(this).val(value);
    });
  },
  smsCode: function(){
    var _btn = option.smscode;
    var _form = option.form;
    var _data = {};
    var _disableSubmit = function(msg){
      if ( msg ) {
        $(_btn).parents().siblings('.help-inline').empty().removeClass('success-msg info-msg')
        .addClass('error-msg').append(msg);
      }
      //$(_btn).prop('disabled', true);
    };
    var _mobile = $('#J_smscode').data('mobile');
    var _amount = $('#J_smscode').data('amount');
    _data = {
        mobile: _mobile,
        amount: _amount
    };
    if (isSubmiting){
      return;
    }
    $(_form).on('click', _btn, function(){
      $.post('/api/smscode/withdraw', _data)
        .done(function(json){
          if(json.status !== 0){
            _disableSubmit(json.message);
            return false;
          }
          $(_btn).parents().siblings('.help-inline').empty();
          startCountDown();
        });
    });
  },
  compar: function() {
    var amount = '#J_withdraw-amount';
    var submitBtn = '#J_withdraw-btn';
    var _disableSubmit = function(msg) {
      if (msg) {
        $(amount).parent().siblings('.help-inline').empty().removeClass('success-msg info-msg')
      .addClass('error-msg').append(msg);
      }
      $(submitBtn).prop('disabled', true);
    };
    var _enableSubmit = function() {
      $(submitBtn).prop('disabled', false);
    };
    $(amount).on('keyup keydown', function(e){
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
    $(amount).on('keyup blur', function() {
      var iptVal = $(this).val();
      if (!$(this).valid()) {
        return _enableSubmit();
      }
      if (!iptVal.length) {
        return _enableSubmit();
      }
      if(isNaN(iptVal)){
        _disableSubmit(ErrMsg.isNumber);
        return false;
      }
      iptVal = iptVal - 0 || 0;
      if (iptVal < 1) {
        _disableSubmit(ErrMsg.withdrawError);
        return false;
      }
      return _enableSubmit();
    });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'trigger', 'smscode', 'input'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.bankCard();
    me.amount();
    me.compar();
    me.smsCode();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = accountSetting;
