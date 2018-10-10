'user strict';

import util from './util';
var {trackEvent} = require('./statistics');
var ErrMsg = util.ErrMsg;
var verifyCode = require('../js/verifycode');

var $el = {};
var option;
var defaultOption = {
  form: '#J_register-form',
  mobile: '#J_mobile',
  password: '#J_password',
  trigger: '#J_verifycode',
  smscode: '#J_smscode'
};
var flag = false;
var timer, timer2;

function toastAnimate(errContainer) {
  errContainer.show().addClass('toast-show');
  if (timer || timer2){
    clearTimeout(timer);
    clearTimeout(timer2);
  }
  timer = setTimeout(function() {
    errContainer.removeClass('toast-show').addClass('toast-hide');
    timer2 = setTimeout(function() {
      errContainer.empty().hide();
    }, 1000);
  }, 1000);
}

function baiduTrackEvent(action) {
  var utmSource = $('input[name="utmSource"]').val();
  trackEvent(utmSource, action);
}

var landingSignupStep = {
  stepRegisterShow: function() {
    $('#J_form-control-mobile, .J_landing-miya-signup-step1-banner, .J_landing-miya-product').addClass('hide');
    $('#J_form-control-register, .J_landing-miya-signup-platform , .J_landing-miya-signup-step2-banner').removeClass('hide');
    $('.J_form-tips').text(app.util.safeMobile($('#J_mobile').val()));
    $('#J_btn-invite-submit').html('立即绑定');
    $('.J_landing-register-weisha-submit').html('立即注册');
    if (option.trackEventSubmit) {
      option.trackEventSubmit();
    }
  },
  formSubmit: function() {
    var me = this;
    var errContainer = $('#J_signup_error_container');
    errContainer.empty();
    if($('#J_form-control-register').hasClass('hide')){
      baiduTrackEvent('submit1');
      $(defaultOption.trigger).trigger('click');
      if (option.trackEventVerifycode) {
        option.trackEventVerifycode();
      }
      me.stepRegisterShow();
      $(document).scrollTop(0);
      return false;
    }

    if (flag) {
      return;
    }
    var _formData = $el.form.serialize();
    flag = true;
    baiduTrackEvent('submit2');
    $.post('/api/register', _formData).done(function(json) {
      flag = false;
      if (json.status != 0) {
        errContainer.removeClass('toast-hide').addClass('toast-show').show().html('<span>' + json.message + '</span>');
        toastAnimate(errContainer);
        return;
      }
      option.successCallback();
    }).fail(function() {
      flag = false;
      errContainer.removeClass('toast-hide').addClass('toast-show').show().html('<span>网络错误.稍后再试</span>');
      toastAnimate(errContainer);
    });
  },
  openOrDownloadApp: function(downloadHandler) {
    $(downloadHandler).on('click', function() {
      app.judgeInstallApp.openOrDownloadApp({iosUrl: 'itms-apps://itunes.apple.com/cn/app/hong-xiao-bao/id1119411654?mt=8'});
      baiduTrackEvent('downloadApp');
      if(option.trackEventDownload){
        option.trackEventDownload();
      }
    });
  },
  positionToast: function(positionToastValue) {
    var _postion = positionToastValue ? positionToastValue :  $(document).scrollTop() + 100;
    function toastPosition() {
      $('#J_signup_error_container').css('top', _postion);
    }
    $('#J_btn-invite-submit').on('click', toastPosition);
    $(document).scroll(toastPosition);
  },
  bindValidate: function(form, options) {
    var opt;
    var me = this;
    if (!form || !!form._bindValidate) {
      return form;
    }
    opt = {
      errorElement: 'span',
      errorLabelContainer: '#J_signup_error_container',
      wapper: 'div',
      rules: {
        mobile: {
          required: true,
          isMobile: true,
          remote: {
            url: '/api/checkMobile',
            type: 'post',
            dataFilter: function(data) {
              if (data === 'true') {
                return true;
              }else if(data === 'false' && option.miyaTurntableRegister){
                option.successCallback();
              }else {
                return false;
              }
            }
          }
        },
        smscode: {
          required: true,
          rangelength: [6, 6],
          isPwdIllegal: true
        },
        password: {
          required: true,
          rangelength:[8,20],
          isPwdIllegal: true,
          isPwdPure: true,
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
        smscode: {
          required: ErrMsg.isEmptySmsCode,
          rangelength: ErrMsg.isSmsCode,
          isPwdIllegal: ErrMsg.isSmsCode
        },
        password: {
          required: ErrMsg.emptyPwd,
          rangelength: ErrMsg.lenPwd
        }
      },
      submitHandler: function(){
        me.formSubmit();
      },
      showErrors: function(errorMap, errorList){
        var i, elements, error;
        if ( this.errorList.length ) {
          error = this.errorList[0];
          if ( this.settings.highlight ) {
            this.settings.highlight.call( this, error.element, this.settings.errorClass, this.settings.validClass );
          }
          if (option.mobileHadSign && option.mobileHadSign(error.message)) {
            return;
          }
          this.showLabel( error.element, error.message );
          toastAnimate($(this.containers));
        } else {
          if (options.exchangePrizesByChild) {
            options.exchangePrizesByChildFun();
          }
        }
        if ( this.errorList.length ) {
          this.toShow = this.toShow.add( this.containers );
        }
        if (errorList.length == 1 && errorMap['password'] || errorList.length == 1 && errorMap['smscode']) {
          this.showLabel( error.element, error.message );
          return;
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
        $('#J_signup_error_container').empty();
      },
      onfocusout: false,
      onkeyup: false
    };

    if (options) {
      $.extend(true, opt, options);
    }
    $(form).validate(opt);
    form._bindValidate = true;
  },
  init: function(opt) {
    baiduTrackEvent('open Page1');
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.bindValidate($el.form, opt);
    me._verifycode = verifyCode({
      action: 'inviteRegister',
      input: option.mobile,
      trigger: option.trigger,
      smscode: option.smscode
    });
    me.positionToast(option.positionToastValue);
    me.openOrDownloadApp(option.downloadHandler);
  },
};

exports = module.exports = landingSignupStep;