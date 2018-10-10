'use strict';
var util = require('./util');
var verifyCode = require('./verifycode');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_forgot-step',
  mobile: '#J_mobile',
  captcha: '#J_captcha',
  captchaimg: '.J_captcha-refresh',
  trigger: '#J_verifycode',
  captchaholder: '#J_captcha-holder'
};

var loginForgotStep = {
  bindValidate: function(form){
    var opt;
    if ( !form || form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      rules:{
        mobile: {
          required: true,
          isMobile: util.reMobile,
          remote: {
            url: '/api/checkExistMobile',
            method: 'post'
          }
        },
        captcha: {
          required: true,
          minlength: 4,
          maxlength: 4,
        },
        smscode: {
          required: true,
          minlength: 6,
          maxlength: 6
        },
        newPassword: {
          required: true,
          maxlength: 20,
          minlength: 8,
          isPwdIllegal: true,
          isPwdPure: true,
        },
        repeatPassword: {
          required: true,
          maxlength: 20,
          minlength: 8,
          equalTo: '#newPassword'
        }
      },
      messages:{
        mobile: {
          required: ErrMsg.emptyMobile,
          isMobile: ErrMsg.isMobile,
          maxlength: ErrMsg.isMobile,
          minlength: ErrMsg.isMobile,
          remote: ErrMsg.mobileNotExists
        },
        captcha:{
          required: ErrMsg.isCaptcha,
          minlength: ErrMsg.isCaptcha,
          maxlength: ErrMsg.isCaptcha
        },
        smscode: {
          required: ErrMsg.emptyCode,
          minlength: ErrMsg.lenCaptcha,
          maxlength: ErrMsg.lenCaptcha
        },
        newPassword: {
          required: ErrMsg.emptyNewPwd,
          maxlength: ErrMsg.lenPwd,
          minlength: ErrMsg.lenPwd,
          isPwdIllegal: ErrMsg.isPwdPure,
          isPwdPure: ErrMsg.purePwd,
        },
        repeatPassword: {
          required: ErrMsg.emptyNewPwd,
          maxlength: ErrMsg.isPwd,
          minlength: ErrMsg.isPwd,
          equalTo: ErrMsg.rePwd
        }
      },
      success: function(msg, el){
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

  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bindValidate($el.form);
    me._verifycode = verifyCode({
      action: 'forgot',
      input: option.mobile,
      trigger: option.trigger,
      captcha: option.captcha,
      captchaimg: option.captchaimg,
      captchaholder: option.captchaholder
    });
    me._init = true;
    return me;
  }
};

exports = module.exports = loginForgotStep;