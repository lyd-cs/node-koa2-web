/**
 * account secure
 */
'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var defaultOption = {
  form: '#J_secure-form'
};
var option;

function bindValidate(form, options){
  var opt;
  if ( !form || form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      name: {
        required: true,
        isChinese: true
      },
      idNo: {
        required: true,
        maxlength: 18,
        minlength: 18
      },
      tradpwd: {
        required: true,
        maxlength: 20,
        minlength: 8,
        isPwdIllegal: true,
        isPwdPure: true
      },
      tradrepwd: {
        required: true,
        maxlength: 20,
        minlength: 8,
        isPwdIllegal: true,
        isPwdPure: true,
        equalTo: '#J_trad-pwd'
      }
    },
    messages:{
      name: {
        required: ErrMsg.emptyRealname,
        isChinese: ErrMsg.isRealname
      },
      idNo: {
        required: ErrMsg.emptyIdentity,
        maxlength: ErrMsg.isMateIdentity,
        minlength: ErrMsg.isMateIdentity
      },
      tradpwd: {
        required: ErrMsg.isEmptyTradPwd,
        maxlength: ErrMsg.isPwd,
        minlength: ErrMsg.isPwd
      },
      tradrepwd: {
        required: ErrMsg.emptyReNewPwd,
        maxlength: ErrMsg.isPwd,
        minlength: ErrMsg.isPwd,
        equalTo: ErrMsg.rePwd
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
  if ( options ) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var accountSecure = {
  checkAgree: function() {
    var _icheck = $('#J_agree-check');
    var _submitBtn = $('.btn-secure-submit');
    $('#J_agree').on('click', function() {
      if (_icheck.prop('checked')) {
        _submitBtn.attr('disabled',false);
      }else {
        _submitBtn.attr('disabled',true);
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
    me.checkAgree();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = accountSecure;
