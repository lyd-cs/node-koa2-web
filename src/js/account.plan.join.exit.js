'use strict';

var util = require('./util');
var verifyCode = require('./verifycode.pwd');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var option;
var $el = {};

function bindValidate(form) {
  var opt;
  if (!form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    onfocus: false,
    success: function(el) {
      $(el).parent().siblings('.help-inline').empty();
    },
    rules: {
      smscode: {
        required: true
      }
    },
    messages: {
      smscode: {
        required: ErrMsg.isEmptySmsCode
      }
    }
  });
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountPlanJoinExit = {
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, opt);
    $.each(['form'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindValidate($el.form);
    me._verifycode = verifyCode({
      action: 'calmperiod',
      trigger: option.trigger,
      mobile: option.mobile,
      smscode: option.smscode,
      form: option.form
    });
    me._init = true;
    return me;
  }
};

exports = module.exports = accountPlanJoinExit;