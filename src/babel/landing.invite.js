'user strict';

import util from './util';
var {trackEvent} = require('./statistics');
var ErrMsg = util.ErrMsg;
var verifyCode = require('../js/verifycode');

var $el = {};
var option;
var defaultOption = {
  form: '#J_invite_register-form',
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

var landingInvite = {
  stepMobileShow: function() {
    trackEvent('H5', 'openPage2', 'inviteRegister');
    $('#J_landing-redpackage, #J_landing-register-form-download, #J_form-control-register').addClass('hide');
    $('#J_landing-register, #J_form-control-mobile,  #J_invite_register-form').addClass('landing-register-show');
  },
  stepRegisterShow: function() {
    trackEvent('H5', 'openPage3', 'inviteRegister');
    $('#J_form-control-mobile').removeClass('landing-register-show').addClass('hide');
    $('#J_form-control-register').removeClass('hide').addClass('landing-register-show');
    $('#J_landing-register-form-download').addClass('hide');
    $('.J_form-tips').text('验证码发送至：' + app.util.safeMobile($('#J_mobile').val()));
  },
  stepDownloadShow: function() {
    trackEvent('H5', 'openPage4', 'inviteRegister');
    $('.J_poster-desc').text('红包已绑定至您的红小宝账户');
    $('#J_invite_register-form').removeClass('landing-register-show').addClass('hide');
    $('#J_landing-register-form-download').removeClass('hide').addClass('landing-register-show');
  },
  openRedPackage: function() {
    trackEvent('H5', 'openPage0', 'inviteRegister');
    var me = this;
    var $this = $('.J_landing-redpackage-open-logo');
    $this.on('click', function() {
      trackEvent('H5', 'openPage1', 'inviteRegister');
      if ($this.hasClass('open-rotate')) {
        return;
      }
      $this.addClass('open-rotate');
      setTimeout(function() {
        $this.removeClass('open-rotate');
        me.stepMobileShow();
      }, 1200);
    });
  },
  formSubmit: function() {
    var me = this;
    var errContainer = $('#J_invite-register-error-container');
    errContainer.empty();
    if($('#J_form-control-register').hasClass('hide')){
      trackEvent('H5', 'submit1', 'inviteRegister');
      $(defaultOption.trigger).trigger('click');
      me.stepRegisterShow();
      trackEvent('H5', 'submit2', 'inviteRegister');
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
    $('#J_landing-register-download').on('click', function() {
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
  countSendSmscode: function() {
    $(defaultOption.trigger).click(function() {
      trackEvent('H5', '再次发送短验', 'inviteRegister');
    });
  },
  init: function(opt) {
    var me = this;
    me.openRedPackage();
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
    me.countSendSmscode();
  },
};

exports = module.exports = landingInvite;