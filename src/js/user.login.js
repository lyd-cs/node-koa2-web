/**
 * handler login
 */
var util = require('./util');

var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_login-form',
  user: '#J_username',
  pwd: '#J_pwd',
  tip: '#J_login-error',
  captcha: '#J_captcha'
};
var option;

function bindValidate(form, options) {
  var opt;
  if (!form || !!form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    errorElement: 'span',
    errorLabelContainer: '#J_login-error-label-container',
    wapper: 'li',
    showErrors: function(errorMap, errorList){
      if(errorList.length){
        $('#J_login-error-label-container').addClass('error-msg').html(errorList[0].message);
        $(errorList[0].element).addClass('error');
      }
      if(errorList.length == 1 && errorMap.captcha){
        $('#J_captcha').addClass('error');
      } else {
        $('#J_captcha').removeClass('error');
      }
    },
    onfocusout: false,
    onkeyup: false,
    rules: {
      mobile: {
        required: true,
        maxlength: 11,
        minlength: 11,
        isMobile: true
      },
      captcha: {
        required: true,
        rangelength: [4, 4],
        remote:{
          url: '/api/checkCaptcha',
          type: 'post'
        }
      },
      password: {
        required: true
      }
    },
    messages: {
      mobile: {
        required: ErrMsg.emptyMobile,
        maxlength: ErrMsg.isMobile,
        minlength: ErrMsg.isMobile,
        rangelength: ErrMsg.isMobile
      },
      captcha: {
        required: ErrMsg.emptyCaptcha,
        rangelength: ErrMsg.lenCaptcha,
        remote: ErrMsg.isCaptcha
      },
      password: {
        required: ErrMsg.emptyPwd,
        rangelength: ErrMsg.lenPwd
      }
    },
  });
  if (options) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var login = {
  switchTab: function(){
    var loginTab = $('#J_login-form');
    var signupTab = $('#J_user-signup-form');
    $('#J_user-operate-login').on('click', function(){
      $(this).addClass('active');
      $('#J_user-operate-signup').removeClass('active');
      loginTab.addClass('selected');
      signupTab.removeClass('selected');
    });
    $('#J_user-operate-signup').on('click', function(){
      $(this).addClass('active');
      $('#J_user-operate-login').removeClass('active');
      signupTab.addClass('selected');
      loginTab.removeClass('selected');
    });
  },
  captchaFresh: function(){
    $('#J_captcha-img').on('click', function(){
      var $target = $($(this).data('target'));
      var src = $target.data('src');
      $target.attr('src', (src + '?' + Math.random()));
      return false;
    });
  },
  forbidBtn: function(){
    $('.agreement-control').on('change', function(){
      if(!$(this).prop('checked')){
        $(this).parents('form').find('.form-button').prop('disabled', true);
        return;
      }
      $(this).parents('form').find('.form-button').prop('disabled', false);
    });
  },
  formValidate: function(){
    $('#J_submit-login').on('click', function(){
      var $elem = $('#J_username, #J_pwd');
      $elem.each(function(){
        var _me = this;
        if($(this).is(_me)){
          $(this).parent().siblings().find('input').removeClass('error');
          return false;
        }
      });
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'user', 'pwd', 'tip', 'captcha'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindValidate($el.form);
    me.captchaFresh();
    me.switchTab();
    me.forbidBtn();
    me.formValidate();
    me._init = true;
    return me;
  }
};

exports = module.exports = function(opt){
  return login.init(opt);
};
