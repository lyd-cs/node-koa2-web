/**
 * account setting
 */
'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_unbindCard',
  trigger: '#J_unbindCard-submit'
};
var option;

function bindValidate(form, options){
  var opt;
  if (!form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      identityNo: {
        required: true,
        maxlength: 18,
        minlength: 18
      },
      tradPassword: {
        required: true,
        maxlength: 6,
        minlength: 6
      }
    },
    onkeyup: false,
    messages: {
      identityNo: {
        required: ErrMsg.emptyIdentity,
        maxlength: ErrMsg.isIdentity,
        minlength: ErrMsg.isIdentity
      },
      tradPassword: {
        required: ErrMsg.isEmptyTradPwd,
        maxlength: ErrMsg.lenTradPwd,
        minlength: ErrMsg.lenTradPwd
      }
    },
    success: function(msg, el){
      $(el).parent().siblings('.help-inline').empty();
    },
    submitHandler: function(form) {
      $(option.trigger).attr('disabled', true);
      form.submit();
    }
  });
  if(options){
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountUnbind = {
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'trigger', 'identityNo', 'tradPassword'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = accountUnbind;
