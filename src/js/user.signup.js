'use strict';
var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;
var verifyCode = require('./verifycode');
var tpl = require('../../tpl/mod/jdcard.active.signup.success.pug');

var $el = {};
var flag = false;
var option;
var defaultOption = {
  form: '#J_user-signup-form',
  mobile: '#J_mobile',
  password: '#J_password',
  captcha: '#J_graphicCode',
  captchaimg: '#J_graphicCode_container',
  trigger: '#J_verifycode',
  captchaholder: '.form-group-graphicCode',
  smscode: '#J_smscode',
  voiceVerifycode: '#J_voice-verifycode'
};

function validatePass(elem){
  $(elem).removeClass('error');
  $('.error-label-container').empty();
  return true;
}

var userSignupDetail = {
  bindValidate: function(form, options) {
    var me = this;
    var opt;
    if (!form || !!form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      errorElement: 'li',
      errorLabelContainer: '#J_signup-error-label-container',
      wapper: 'li',
      showErrors: function(errorMap, errorList){
        var i, elements, error;
        if ( this.errorList.length ) {
          error = this.errorList[0];
          if ( this.settings.highlight ) {
            this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
          }
          this.showLabel( error.element, error.message );
        }
        if ( this.errorList.length ) {
          this.toShow = this.toShow.add( this.containers );
        }
        if (errorList.length == 1 && errorMap['captcha'] && errorMap['smscode']) {
          $('#J_graphicCode').addClass('error');
          $('#J_smscode').removeClass('error');
          return;
        }
        if (errorList.length == 0) {
          $('.form-control').removeClass('error');
          $('.error-label-container').empty();
        }
        if ( this.settings.success ) {
          for ( i = 0; this.successList[ i ]; i++ ) {
            this.showLabel( this.successList[ i ] );
          }
        }
        if ( this.settings.unhighlight ) {
          for ( i = 0, elements = this.validElements(); elements[ i ]; i++ ) {
            this.settings.unhighlight.call( this, elements[ i ], this.settings.errorClass, this.settings.validClass );
          }
        }
        this.toHide = this.toHide.not( this.toShow );
        this.hideErrors();
        this.addWrapper( this.toShow ).show();
      },
      success: function(){
        $('help-inline').remove();
      },
      onfocusout: false,
      onkeyup: false,
      rules: {
        mobile: {
          required: true,
          maxlength: 11,
          minlength: 11,
          isMobile: true,
          remote:{
            url: '/api/checkMobile',
            type: 'post'
          }
        },
        password: {
          required: true,
          rangelength:[8,20],
          isPwdIllegal: true,
          isPwdPure: true,
        },
        captcha: {
          required: true,
          rangelength: [4, 4],
        },
        smscode: {
          required: true,
          rangelength: [6, 6],
          isPwdIllegal: true
        }
      },
      messages: {
        mobile: {
          required: ErrMsg.emptyMobile,
          maxlength: ErrMsg.isMobile,
          minlength: ErrMsg.isMobile,
          rangelength: ErrMsg.isMobile,
          remote: ErrMsg.mobileExists
        },
        captcha: {
          required: ErrMsg.emptyCaptcha,
          rangelength: ErrMsg.isCaptchaCorrect,
          maxlength: ErrMsg.isCaptchaCorrect,
          remote: ErrMsg.isCaptchaCorrect
        },
        smscode: {
          required: ErrMsg.isEmptySmsCode,
          rangelength: ErrMsg.isSmsCode,
          maxlength: ErrMsg.isSmsCode,
          isPwdIllegal: ErrMsg.isSmsCode
        },
        password: {
          required: ErrMsg.emptyPwd,
          rangelength: ErrMsg.lenPwd
        }
      },
      submitHandler: function(){
        if (flag) {
          return;
        }
        flag = true;
        me.formSubmit();
      }
    });
    if (options) {
      $.extend(true, opt, options);
    }
    $(form).validate(opt);
    form._bindValidate = true;
  },
  formSubmit: function(){
    var signupForm = $el.form.get(0);
    var formData = {
      mobile: $(signupForm.mobile).val(),
      smscode: $(signupForm.smscode).val(),
      password: $(signupForm.password).val(),
      sourceValue: $(signupForm.inviteCode).val(),
      utmSource: $(signupForm.utmSource).val(),
      inviteSerial: $(signupForm.inviteSerial).val()
    };
    $.post('/api/signup', formData).done(function(json){
      var $errorTips = $('#J_signup-error-label-container');
      flag = false;
      if (json.status !== 0) {
        $errorTips.css('display', 'block').html(json.message);
        return;
      }
      if (option.isJdActive) {
        $('.J_singup-wrap').html(tpl());
      } else {
        window.location.href='/';
      }
    });
  },
  formValidate: function() {
    $('#J_mobile').on('blur', function(){
      var validator = $('#J_user-signup-form').validate();
      var valid = validator.element('#J_mobile');
      if (!valid) {
        $(this).parent().siblings().find('.form-control').removeClass('error');
        return false;
      }
      validatePass(this);
    });
    $('#J_submit').on('click', function(){
      var valid = true;
      var validator = $('#J_user-signup-form').validate();
      var $elem = $('#J_mobile, #J_password, #J_graphicCode, #J_smscode');
      $elem.each(function(){
        valid = valid && validator.element(this) && validatePass(this);
      });
    });
    $('#J_verifycode').on('click', function(){
      var valid = true;
      var validator = $('#J_user-signup-form').validate();
      var $elem = $('#J_mobile, #J_graphicCode');
      $elem.each(function(){
        valid = valid && validator.element(this) && validatePass(this);
      });
    });
  },
  forbidBtn: function(){
    $('.J_agreement-control').on('change', function(){
      if(!$(this).prop('checked')){
        $(this).parents('form').find('#J_submit').prop('disabled', true);
        return;
      }
      $(this).parents('form').find('#J_submit').prop('disabled', false);
    });
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
      action: 'signup',
      input: option.mobile,
      trigger: option.trigger,
      captcha: option.captcha,
      captchaimg: option.captchaimg,
      captchaholder: option.captchaholder,
      smscode: option.smscode,
      voiceVerifycode: option.voiceVerifycode
    });
    me.formValidate();
    me.forbidBtn();
    me._init = true;
    return me;
  }
};

exports = module.exports = userSignupDetail;