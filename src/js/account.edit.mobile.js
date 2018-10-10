'use strict';
var util = require('./util');
var verifyCode = require('./verifycode.pwd');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_mobile-form',
  trigger: '#J_verifycode',
  action: 'oldmobile'
};

var accountTradPwd = {
  bindValidate: function(form) {
    var opt;
    if (!form || form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      onfocusout: false,
      rules: {
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
          minlength: 6,
          maxlength: 6
        },
        newsmscode: {
          required: true,
          minlength: 6,
          maxlength: 6
        }
      },
      messages: {
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
        newsmscode: {
          required: ErrMsg.isEmptySmsCode,
          minlength: ErrMsg.lenSmsCode,
          maxlength: ErrMsg.lenSmsCode
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
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v) {
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
