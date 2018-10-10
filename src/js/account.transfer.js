'use strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;
var $el = {};
var option;
var isSubmiting = false;

var defaultOption = {
  form: '#buy-confirm-wrapper'
};

var accountTransfer = {
  bindValidate: function(form) {
    var opt;
    if(!form || !!form._bindValidate) {
      return form;
    }
    opt = $.extend({}, Form.validate, {
      onkeyup:false,
      rules: {
        password: {
          required: true,
          isTradPwd: true
        }
      },
      messages: {
        password: {
          required: ErrMsg.isEmptyTradPwd,
          isTradPwd: ErrMsg.isFormatTradPwd,
          maxlength: ErrMsg.lenTradPwd,
          minlength: ErrMsg.lenTradPwd
        }
      },
      success: function(){
        $('.trade-error').text('');
        var pwd = $('[name="password"]').val();
        $('[name="cashPassword"]').val(pwd);
      },
      errorPlacement: function(place){
        $('.trade-error').html(place);
      }
    });
    $(form).validate(opt);
    form._bindValidate = true;
  },
  formSubmit: function(){
    $('#buy-confirm-wrapper').on('submit', function(){
      if(isSubmiting){
        return false;
      }
      isSubmiting = true;
      timer = setTimeout(function(){
        isSubmiting = false;
      },5000);
    });
  },
  checkboxChecked: function(opt){
    $('#J_submit').on('change', function(){
      var temp = $('#J_submit').is(':checked');
      var _isError = opt.isError - 0 || 0;
      if(!temp || _isError){
        $('#J_btn-buy-confirm').attr('disabled', 'disabled');
        return false;
      }
      $('#J_btn-buy-confirm').removeAttr('disabled');
    });
  },
  init: function(opt) {
    var me = this;
    if ( !!me._init ){
      return me;
    }
    option = $.extend({}, defaultOption);
    $.each(['form'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.bindValidate($el.form);
    me.checkboxChecked(opt);
    me.formSubmit();
    me._init = true;
    return me;
  }
};
exports = module.exports = accountTransfer;