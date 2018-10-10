'use strict';
var util = require('./util');
var verifyCode = require('./verifycode');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_mobile-form',
  mobile: '#J_mobile',
  captcha: '#J_captcha',
  captchaimg: '.J_captcha-refresh',
  trigger: '#J_verifycode',
  captchaholder: '#J_captcha-holder'
};

function bindValidate(form){
  var opt;
  if ( !form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    onkeyup: false,
    rules:{
      mobile: {
        required: true,
        isMobile: util.reMobile,
        remote: {
          url: '/api/checkMobile',
          method: 'post'
        }
      },
      captcha: {
        required: true,
      },
      newsmscode: {
        required: true,
        minlength: 4,
        maxlength: 6
      }
    },
    messages:{
      mobile: {
        required: ErrMsg.emptyMobile,
        isMobile: ErrMsg.isMobile,
        maxlength: ErrMsg.isMobile,
        minlength: ErrMsg.isMobile,
        remote: ErrMsg.mobileExists
      },
      captcha:{
        required: ErrMsg.isCaptcha,
        minlength: ErrMsg.isCaptcha,
        maxlength: ErrMsg.isCaptcha
      },
      newsmscode: {
        required: ErrMsg.emptyCode,
        minlength: ErrMsg.lenCaptcha,
        maxlength: ErrMsg.lenCaptcha
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
}

var accountNewPwd = {
  checkCaptcha: function() {
    var $el = $('#J_captcha-holder');
    $(option.form).on('submit',function(event) {
      if ($el.hasClass('hide')){
        $el.removeClass('hide');
        event.preventDefault();
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
    $.each(['form'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.checkCaptcha();
    bindValidate($el.form);
    me._verifycode = verifyCode({
      action: 'newmobile',
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

exports = module.exports = accountNewPwd;
