/**
 * account setting
 */
'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_mobile-form',
  trigger: '#J_verifycode'
};
var isSubmiting = false;
var option;
var _timer;
var _count = 0;
var defCount = 60;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $el.trigger.prop('disabled', true).text(_title);
  isSubmiting = true;
};
function enbaleVerify(){
  _count = 0;
  clearTimeout(_timer);
  $el.trigger.prop('disabled', false).text($el.trigger.data('origin'));
  isSubmiting = false;
};
function countDown(){
  disableVerify();
  if ( _count <=0 ) {
    enbaleVerify();
  }
  _count--;
};
function startCountDown(){
  _count = defCount;
  countDown();
  _timer = setInterval(function(){
    countDown();
  }, 1000);
};
function showError(msg){
  $el.validator.showErrors({
    smscode: msg
  });
  $el.input.focus();
}
function bindValidate(form, options){
  var opt;
  if ( !form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      identity: {
        required: true,
        maxlength: 18,
        minlength: 18
      },
      smscode: {
        required: true,
        maxlength: 6,
        minlength: 6
      },
      mobileNumber: {
        required: true,
        maxlength: 11,
        minlength: 11
      }
    },
    messages:{
      identity: {
        required: ErrMsg.emptyIdentity,
        maxlength: ErrMsg.isIdentity,
        minlength: ErrMsg.isIdentity
      },
      smscode: {
        required: ErrMsg.emptyCode,
        maxlength: ErrMsg.isCode,
        minlength: ErrMsg.isCode
      },
      mobileNumber: {
        required: ErrMsg.emptyMobile,
        maxlength: ErrMsg.isMobile,
        minlength: ErrMsg.isMobile
      }
    }
  });
  if ( options ) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountSetting = {
  send: function(data){
    $.post('/api/smscode/send', data)
      .done(function(json){
        if(json.status !== 0){
          showError(json.message);
          return;
        }
      }).fail(function(){
        enbaleVerify();
      });
  },
  bindEvent: function(){
    var me = this;
    var form = $('#J_mobile-form');
    form.on('click', '#J_verifycode', function(){
      var _data = {
        mobile: $('#J_mobile-num').val()
      };
      if(isSubmiting){
        return;
      }
      me.send(_data);
      startCountDown();
    });
  },
  typeJuge:function(hasRiskVail){
    var type ='';
    switch (true){
      case hasRiskVail <= 14:
        type='保守型';
        break;
      case hasRiskVail > 14 && hasRiskVail <= 36:
        type='稳健型';
        break;
      case hasRiskVail>36:
        type='积极应对型';
        break;
      default:
        type='保守型';
    }
    $('#risktype').html(type);
  },
  unbindCard:function(){
    $('#J_unbind-bankcard-btn').on('click',function(){
      $('#J_send_modal').modal();
      return false;
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'trigger'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindValidate($el.form);
    me.bindEvent();
    me.unbindCard();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountSetting;
