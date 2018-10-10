/**
 * account recharge
 */
'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;
var _tpl_Account_Recharge = require('./tpl/account.recharge.banktips.pug');

var $el = {};
var defaultOption = {
  form: '#J_recharge-form'
};
var option;

function bindValidate(form, options){
  var opt;
  if ( !form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      amount: {
        required: true,
        isCash: true
      },
      bankid: {
        minlength: 7
      },
      paypassword: {
        required: true,
        maxlength: 20,
        minlength: 8
      }
    },
    messages:{
      amount: {
        required: ErrMsg.isEmptyCharge,
        isCash: ErrMsg.isCash
      },
      bankid: {
        minlength: ErrMsg.isBankCardId
      },
      paypassword: {
        required: ErrMsg.isEmptyTradPwd,
        maxlength: ErrMsg.lenPwd,
        minlength: ErrMsg.lenPwd
      }
    }
  });
  if ( options ) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountSetting = {
  bankCard: function(){
    $('#J_bankid').keyup(function(){
      var value=$(this).val().replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,'$1 ');
      $(this).val(value);
    });
  },
  bankTips: function(){
    $('#J_recharge-form').on('click', '.bank-icon', function(){
      var that = $(this);
      $('.bank-active').removeClass('bank-active');
      that.parent().addClass('bank-active');
      $('#J_banktips').html(_tpl_Account_Recharge({
        itemIdx: that.data('index')
      }));
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bankCard();
    me.bankTips();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = accountSetting;
