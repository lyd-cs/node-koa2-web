'use strict';
var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_password-form'
};

var accountEditPwd = {
  bindValidate: function(form) {
    var opt;
    if (!form || form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      rules: {
        oldpwd: {
          required: true,
          maxlength: 20,
          minlength: 8,
          isPwdIllegal: true,
          isPwdPure: true
        },
        newpwd: {
          required: true,
          maxlength: 20,
          minlength: 8,
          isPwdIllegal: true,
          isPwdPure: true
        },
        renewpwd: {
          required: true,
          maxlength: 20,
          minlength: 8,
          isPwdIllegal: true,
          isPwdPure: true,
          equalTo: '#J_new-pwd'
        }
      },
      messages: {
        oldpwd: {
          required: ErrMsg.emptyPwd,
          maxlength: ErrMsg.lenPwd,
          minlength: ErrMsg.lenPwd
        },
        newpwd: {
          required: ErrMsg.emptyNewPwd,
          maxlength: ErrMsg.lenPwd,
          minlength: ErrMsg.lenPwd
        },
        renewpwd: {
          required: ErrMsg.emptyReNewPwd,
          maxlength: ErrMsg.lenPwd,
          minlength: ErrMsg.lenPwd,
          equalTo: ErrMsg.rePwd
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
    me._init = true;
    return me;
  }
};

exports = module.exports = accountEditPwd;
