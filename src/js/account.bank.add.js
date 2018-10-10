'use strict';
var util = require('./util');
var bankCardChecked = require('./bank.number.checked.js');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_bank-add',
  mobile: '#J_mobile',
  banknumber: '#J_bank-number',
  bankname: '#J-bank-name',
  bankcode: '#J_bank-code',
  banklimit: '#J_bank-card-limit',
  bankerror: '#J_bank-card-error',
  showbankname: '.J_show-bank-list'
};
var isRenderBank = false;
var tpl_modal = require('./tpl/account.bank.list.pug');

function bindValidate(form) {
  var opt;
  if (!form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules: {
      mobile: {
        required: true,
        isMobile: util.reMobile,
        maxlength: 11,
        minlength: 11
      }
    },
    messages: {
      mobile: {
        required: ErrMsg.emptyMobile,
        isMobile: ErrMsg.isMobile,
        maxlength: ErrMsg.isMobile,
        minlength: ErrMsg.isMobile
      }
    },
    success: function(msg, el) {
      var parent = $(el).parents('.form-group');
      var holder = $('.help-inline', parent);
      if (!holder.length) {
        holder = $('<div class="help-inline"></div>').appendTo(parent);
      }
      holder.empty().removeClass('error-msg info-msg');
      $('span', holder).remove();
    }
  });
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountNewPwd = {
  bankCard: function() {
    $('#J_bankid').keyup(function() {
      var value = $(this).val().replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
      $(this).val(value);
    });
  },
  renderBank: function() {
    var _data = option.bankTips;
    var _list = option.bankCodeList;
    $('#J_bank-list').html(tpl_modal({
      data: _data,
      list: _list
    }));
    isRenderBank = true;
  },
  selectBank: function() {
    var _me = this;
    $('#J_show-bank-list').on('click', function(){
      if (!isRenderBank) {
        _me.renderBank();
      }
      $('.modal-bank-list').modal('show');
    });
  },
  formSubmitHandle: function() {
    var validator = $('#J_bank-add').validate();
    $('#J_bank-add').on('submit', function(){
      var banknumber = $('#J_bank-number').val();
      if (!banknumber) {
        $('#J_bank-card-error').html(ErrMsg.isBankIdEmpty);
        return false;
      }
      if (!validator.form() || !($('#J_bank-number').data('passed') == 1)) {
        return false;
      }
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'mobile'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bankCard();
    me._bankCardChecked = bankCardChecked.init({
      banknumber: option.banknumber,
      bankname: option.bankname,
      bankcode: option.bankcode,
      banklimit: option.banklimit,
      bankerror: option.bankerror,
      showbankname: option.showbankname,
      banktips: option.bankTips
    });
    bindValidate($el.form);
    me.renderBank();
    me.selectBank();
    me.formSubmitHandle();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountNewPwd;