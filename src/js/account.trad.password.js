'use strict';
var util = require('./util');
var verifyCode = require('./verifycode.pwd');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_trad-password-form',
  trigger: '#J_verifycode',
  identity: '#J_identity',
  action: 'tradpwd'
};

var accountTradPwd = {
  bindValidate: function(form){
    var opt;
    if ( !form || form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      rules:{
        identity: {
          required: true,
          maxlength: 18,
          minlength: 18,
          remote: {
            url: '/api/checkIdentityAuth',
            method: 'post'
          }
        },
        smscode: {
          required: true,
          minlength: 4,
          maxlength: 6
        },
        newtradpwd: {
          required: true,
          maxlength: 6,
          minlength: 6,
          isTradPwd: true
        },
        retradpwd: {
          required: true,
          maxlength: 6,
          minlength: 6,
          isTradPwd: true,
          equalTo: '#J_trad-password'
        }
      },
      messages:{
        identity: {
          required: ErrMsg.emptyIdentity,
          maxlength: ErrMsg.isMateIdentity,
          minlength: ErrMsg.isMateIdentity,
          remote: ErrMsg.isMateIdentity
        },
        smscode: {
          required: ErrMsg.isEmptySmsCode,
          minlength: ErrMsg.lenSmsCode,
          maxlength: ErrMsg.lenSmsCode
        },
        newtradpwd: {
          required: ErrMsg.isEmptyTradPwd,
          maxlength: ErrMsg.lenTradPwd,
          minlength: ErrMsg.lenTradPwd
        },
        retradpwd: {
          required: ErrMsg.emptyReNewPwd,
          maxlength: ErrMsg.lenTradPwd,
          minlength: ErrMsg.lenTradPwd,
          equalTo: ErrMsg.rePwd
        }
      },
      success: function(msg, el) {
        var parent = $(el).parents('.form-group');
        var holder = $('.help-inline', parent);
        if(!holder.length){
          holder = $('<div class="help-inline"></div>').appendTo(parent);
        }
        holder.empty().removeClass('error-msg info-msg');
        $('span', holder).remove();
      }
    });
    $(form).validate(opt);
    form._bindValidate = true;
  },
  init: function(opt) {
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'trigger', 'input', 'smscode'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bindValidate($el.form);
    me._verifycode = verifyCode({
      action: option.action,
      input: option.input,
      mobile: option.mobile,
      smscode: option.smscode,
      trigger: option.trigger,
      form: option.form,
      idIdentity: option.idIdentity
    });
    me._init = true;
    return me;
  }
};

exports = module.exports = accountTradPwd;
