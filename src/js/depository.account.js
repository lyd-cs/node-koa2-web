'use strict';

var util = require('./util');
var bankCardChecked = require('./bank.number.checked.js');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_user-createaccount-form',
  tip: '#J_createaccount-error',
  banknumber: '#J_bank-number',
  bankname: '#J_bank-name',
  bankcode: '#J_bank-code',
  banklimit: '.J_bank-card-limit',
  bankerror: '#J_bank-card-error',
  showbankname: '.J_show-bank-list'
};

var tpl_modal = require('./tpl/account.bank.list.pug');
var option;
var isRenderBank = false;
var isSubmitting = false;

function bindValidate(form, options){
  var opt;
  if (!form || !!form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    errorElement: 'span',
    errorPlacement: function(place, el){
      var parent = $(el).parents('.form-group');
      var holder = $('.help-inline', parent);
      if(!holder.length){
        holder = $('<div class="help-inline"></div>').appendTo(parent);
      }
      holder.empty().removeClass('success-msg info-msg')
        .addClass('error-msg').append(place);
      holder.siblings('input').addClass('input-error');
      holder.siblings().find('input').addClass('input-error');
    },
    success: function(msg, el){
      var parent = $(el).parents('.form-group');
      var holder = $('.help-inline', parent);
      if(!holder.length){
        holder = $('<div class="help-inline"></div>').appendTo(parent);
      }
      holder.empty().removeClass('error-msg info-msg');
      holder.siblings('input').removeClass('input-error');
      holder.siblings().find('input').removeClass('input-error');
      $('span', holder).remove();
      $el.tip.empty();
    },
    rules: {
      username: {
        required: true,
        rangelength: [2, 20],
        isChinese: true
      },
      identityCard: {
        required: true,
        rangelength: [2, 20],
        isIdentityCard: true
      },
      bankname: {
        required: true
      },
      // banknumber: {
      //   required: true,
      //   minlength: 15,
      //   maxlength: 27,
      // },
      mobile: {
        required: true,
        maxlength: 11,
        minlength: 11,
        isMobile: true
      },
      tradpwd: {
        required: true,
        maxlength: 6,
        minlength: 6,
        isTradPwd: true
      }
    },
    messages: {
      username: {
        required: ErrMsg.emptyRealname,
        rangelength: ErrMsg.isRealname,
        isChinese: ErrMsg.isRealname
      },
      identityCard: {
        required: ErrMsg.emptyIdentity,
        maxlength: ErrMsg.isIdentity,
        minlength: ErrMsg.isIdentity
      },
      bankname: {
        required: ErrMsg.isEmptyBankName,
      },
      // banknumber: {
      //   required: ErrMsg.isBankIdEmpty,
      //   minlength: ErrMsg.isBankCardId,
      //   maxlength: ErrMsg.isBankCardId,
      //   // remote: '请输入正确的银行卡号'
      // },
      mobile: {
        required: ErrMsg.emptyMobile,
        maxlength: ErrMsg.isMobile,
        minlength: ErrMsg.isMobile,
        rangelength: ErrMsg.isMobile
      },
      tradpwd: {
        required: ErrMsg.emptyPwd,
        maxlength: ErrMsg.lenTradPwd,
        minlength: ErrMsg.lenTradPwd
      }
    },
  });
  if (options) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

// function selectedCheckbox(){
//   var isSelected = $('input[type=checkbox]').prop('checked');
//     if (isSelected) {
//       $('#J_submit-btn').prop('disabled', true);
//       return;
//     }
//     $('#J_submit-btn').prop('disabled');
// }

var createAccount = {
  forbidButton: function(){
    $('input[type=checkbox]').on('change', function(){
      var isSelected = $('input[type=checkbox]').prop('checked');
    if (!isSelected) {
      $('#J_submit-btn').prop('disabled', true);
      return;
    }
    $('#J_submit-btn').prop('disabled', false);
    });
  },
  forbidEnter: function(){
    $('input').on('keypress', function(e){
      if (e.keyCode == 13) {
        return false;
      }
    });
  },
  renderBank: function(){
    var _data = option.bankTips;
    var _list = option.bankCodeList;
    $('#J_bank-list').html(tpl_modal({
        data: _data,
        list: _list
    }));
    isRenderBank = true;
  },
  selectBank: function(){
    var _me = this;
    $('#J_show-bank-list').on('click', function(){
      if (!isRenderBank) {
        _me.renderBank();
      }
      $('.modal-bank-list').modal('show');
    });
  },
  formSubmit: function(){
    var me = this;
    $('#J_submit-btn').on('click', function(e) {
      var createAccountForm = document.forms[0];
      var validator = $(createAccountForm).validate();
      var data = {
        tradPwd: $(createAccountForm.tradpwd).val()
      };
      if (isSubmitting) {
        return;
      }
      if (!option.isIdPassed) {
        data.name = $(createAccountForm.username).val();
        data.idNo = $(createAccountForm.identityCard).val();
      }
      if(!option.isBindCard) {
        data.bankCode = $(createAccountForm.bankcode).val();
        data.bankNumber = $(createAccountForm.banknumber).val();
        data.mobile = $(createAccountForm.mobile).val();
      }
      if (!$(createAccountForm.banknumber).val()) {
        $('#J_bank-number').addClass('input-error');
        $('#J_bank-card-error').html(ErrMsg.isBankIdEmpty);
      }
      if (validator.form() == false) {
        e.preventDefault();
        return false;
      }
      if (validator.form() && $('#J_bank-number').data('passed') == 1) {
        $('#J_submit-btn').html('').addClass('btn-loading');
        isSubmitting = true;
        setTimeout(function() {
          me.send(data);
        }, 2000);
      }
    });
  },
  send: function(data) {
    $.post('/api/account/createaccount', data)
      .done(function(json){
        isSubmitting = false;
        $('#J_submit-btn').html('提交').removeClass('btn-loading');
        if (json.status !== 0) {
          $('#J_errors').html(json.message);
          $('#J_trad-password').val('');
          return;
        }
        $('#J_create-account-section').html(json.data.html);

      }).fail(function(){
        isSubmitting = false;
        $('#J_submit-btn').html('提交').removeClass('btn-loading');
        $('#J_trad-password').val('');
      });
  },
  init: function(opt){
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'tip'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindValidate($el.form);
    me._bankCardChecked = bankCardChecked.init({
      banknumber: option.banknumber,
      bankname: option.bankname,
      bankcode: option.bankcode,
      banklimit: option.banklimit,
      bankerror: option.bankerror,
      showbankname: option.showbankname,
      banktips: option.bankTips
    });
    me.forbidButton();
    me.forbidEnter();
    me.renderBank();
    me.selectBank();
    me.formSubmit();
    me._init = true;
    return me;
  }
};

exports = module.exports = createAccount;