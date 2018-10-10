'user strict';

import util from './util';
var {trackEvent} = require('./statistics');
var ErrMsg = util.ErrMsg;
var Form = util.Form;
var verifyCode = require('../js/verifycode');

var $el = {};
var option;
var defaultOption = {
  form: '#J_user-register-form',
  mobile: '#J_mobile',
  password: '#J_password',
  captcha: '#J_graphicCode',
  captchaimg: '#J_graphicCode_container',
  trigger: '#J_verifycode',
  captchaholder: '.form-group-graphicCode',
  smscode: '#J_smscode'
};

function validatePass(elem){
  $(elem).removeClass('error');
  $('.error-label-container').empty();
  return true;
}

var landingSignup = {
  bindValidate: function(form, options) {
    var opt;
    var me = this;
    if (!form || !!form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      errorElement: 'li',
      errorLabelContainer: '#J_signup-error-label-container',
      wapper: 'li',
      showErrors: function(errorMap, errorList){
        var i, elements, error;
        $('#J_signup-error-label-container').empty();
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
        },
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
        },
      },
      submitHandler: function(){
        me.formSubmit();
      }
    });
    if (options) {
      $.extend(true, opt, options);
    }
    $(form).validate(opt);
    form._bindValidate = true;
  },
  mobileValid: function() {
    $('#J_mobile').on('blur', function(){
      var validator = $('#J_user-register-form').validate();
      var valid = validator.element('#J_mobile');
      if (!valid) {
        $(this).parent().siblings().find('.form-control').removeClass('error');
        return false;
      }
      validatePass(this);
    });
  },
  formValidate: function() {
    $('#J_verifycode').on('click', function(){
      var valid = true;
      var validator = $('#J_user-register-form').validate();
      var $elem = $('#J_mobile, #J_graphicCode');
      $elem.each(function(){
        valid = valid && validator.element(this) && validatePass(this);
      });
    });
  },
  checkboxChecked: function(){
    $('#J_agree').on('change', function(){
      var temp = $('#J_agree').is(':checked');
      if(!temp){
        $('#J_btn-submit').attr('disabled', 'disabled');
        return false;
      }
      $('#J_btn-submit').removeAttr('disabled');
    });
  },
  formSubmit: function(){
    trackEvent('H5', 'submit', 'LP-promotionRegister');
    var $btn = $('#J_btn-submit');
    var _formData = $el.form.serialize();
    if ($btn.data('init')){
      return;
    }
    $btn.data('init', 1);
    $.post('/api/register', _formData).done(function(json){
      $btn.data('init', 0);
      if(json.status !== 0){
        $('#J_signup-error-label-container').html(json.message).show();
        return;
      }
      option.success();
      // trackEvent('H5', 'openPage', 'LP-promotionRegister');
    }).fail(function(){
      $btn.data('init', 0);
      $('#J_signup-error-label-container').html('网络错误.稍后再试').show();
    });
  },
  init: function(opt){
    var me =this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.bindValidate($el.form);
    me._verifycode = verifyCode({
      action: 'inviteRegister',
      input: option.mobile,
      trigger: option.trigger,
      captcha: option.captcha,
      captchaimg: option.captchaimg,
      captchaholder: option.captchaholder,
      smscode: option.smscode
    });
    me.mobileValid();
    me.formValidate();
    me.checkboxChecked();
    me._init = true;
    return me;
  }
};

exports = module.exports = landingSignup;