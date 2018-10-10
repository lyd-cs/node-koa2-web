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
  trackEvent(utmSource, action, '京东卡活动-H5');
}

var registerJdCard = {
  stepRegisterShow: function() {
    baiduTrackEvent('open Page2');
    $('#J_form-control-mobile').addClass('hide');
    $('#J_form-control-register').removeClass('hide');
    $('.J_form-tips').text('验证码发送至：' + app.util.safeMobile($('#J_mobile').val()));
  },
  stepDownloadShow: function() {
    baiduTrackEvent('open Page3');
    $('#J_landing-register-jdcard').addClass('hide');
    $('.J_landing-register-jdcard-success').removeClass('hide');
  },
  formSubmit: function() {
    var me = this;
    var errContainer = $('#J_invite-register-error-container');
    errContainer.empty();
    if($('#J_form-control-register').hasClass('hide')){
      baiduTrackEvent('submit1');
      $(defaultOption.trigger).trigger('click');
      me.stepRegisterShow();
      baiduTrackEvent('submit2');
      return false;
    }

    if (flag) {
      return;
    }
    var _formData = $el.form.serialize();
    flag = true;
    $.post('/api/register', _formData).done(function(json) {
      flag = false;
      if (json.status != 0) {
        errContainer.removeClass('toast-hide').addClass('toast-show').show().html('<span>' + json.message + '</span>');
        toastAnimate(errContainer);
        return;
      }
      me.stepDownloadShow();
    }).fail(function() {
      flag = false;
      errContainer.removeClass('toast-hide').addClass('toast-show').show().html('<span>网络错误.稍后再试</span>');
      toastAnimate(errContainer);
    });
  },
  openOrDownloadApp: function() {
    $('#J_landing-register-jdcard-download').on('click', function() {
      app.judgeInstallApp.openOrDownloadApp();
      trackEvent('H5', 'downloadApp', 'inviteRegister');
    });
  },
  positionToast: function() {
    function toastPosition() {
      $('#J_invite-register-error-container').css('top', $(document).scrollTop()+100);
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
      errorLabelContainer: '#J_invite-register-error-container',
      wapper: 'div',
      rules: {
        mobile: {
          required: true,
          isMobile: true,
          remote: {
            url: '/api/checkMobile',
            type: 'post'
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
          this.showLabel( error.element, error.message );
          toastAnimate($(this.containers));
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
        $('#J_invite-register-error-container').empty();
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
  scrollToTop: function() {
    $('.J_landing-register-jdcard-receive').click(function() {
      baiduTrackEvent('set top');
      $(window).scrollTop(0);
    });
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
    me.positionToast();
    me.openOrDownloadApp();
    me.scrollToTop();
  },
};

exports = module.exports = registerJdCard;