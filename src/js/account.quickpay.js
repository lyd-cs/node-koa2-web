/**
 * gateway charge
 */
var util = require('./util');
var ErrMsg = util.ErrMsg;

//var _tpl_quickpay_loading = require('./tpl/account.quickpay.modal.pug');
var Form = util.Form;


var $el = {};
var defaultOption = {
  form: '#J_buy-form'
};

var option;
var _timer;
var _count = 0;
var defCount = 60;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $el.smscode.prop('disabled', true).text(_title);
  isSubmiting = true;
  // $el.voiceVerifycode.attr('disabled', true).parent().addClass('voice-gray');
};
function enbaleVerify(){
  _count = 0;
  clearTimeout(_timer);
  $el.smscode.prop('disabled', false).text($el.smscode.data('origin'));
  isSubmiting = false;
};
function countDown(){
  disableVerify();
  if ( _count <=0 ) {
    enbaleVerify();
    // $el.voiceVerifycode.attr('disabled', false).parent().removeClass('voice-gray').show();
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
// function showModal(){
//   $('#J_quickpay-loading').html(_tpl_quickpay_loading());
//   $('#J_quickpay-modal').modal({
//     show: true,
//     backdrop: 'static'
//   });
// }

function bindValidate(form, options){
  var opt;
  if ( !form || !!form._bindValidate ) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      amount: {
        required: true
      },
      smscode: {
        required: true
      }
    },
    onkeyup: false,
    messages:{
      amount: {
        required: ErrMsg.isEmptyCharge
      },
      smscode: {
        required: ErrMsg.isEmptySmsCode
      }
    },
    success: function(msg, el){
      $(el).parent().siblings('.help-inline').empty();
    },
    submitHandler: function(form) {
      //showModal();
      $(option.trigger).attr('disabled', true);
      form.submit();
    }
  });
  if ( options ) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var gatewayCharge = {
  amount: function(){
    $('#J_quickpay-amount').keyup(function(){
      var value = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
      $(this).val(value);
    });
  },
  smsCode: function(){
    var _btn = option.smscode;
    // var _voiceVerifycode = option.voiceVerifycode;
    var _form = option.form;
    var _data = {};
    var _disableSubmit = function(msg){
      if ( msg ) {
        $(_btn).parents().siblings('.help-inline').empty().removeClass('success-msg info-msg')
        .addClass('error-msg').append(msg);
      }
      //$(_btn).prop('disabled', true);
    };
    var _amount = $('#J_smscode').data('amount');
    var _mobile = $('#J_smscode').data('mobile');
    _data = {
      amount: _amount,
      mobile: _mobile
    };
    $(_form).on('click', _btn, function(){
      $.post('/api/smscode/quickpay', _data)
        .done(function(json){
          if(json.status !== 0){
            _disableSubmit(json.message);
            return false;
          }
          $(_btn).parents().siblings('.help-inline').empty();
          startCountDown();
        });
    });
    // $(_form).on('click', _voiceVerifycode, function(){
    //   _data.type = 'RECHARGE';
    //   $.post('/api/smscode/quickpayvoice', _data)
    //     .done(function(json){
    //       if(json.status !== 0){
    //         _disableSubmit(json.message);
    //         return false;
    //       }
    //       $(_btn).parents().siblings('.help-inline').empty();
    //       startCountDown();
    //     });
    // });
  },
  compar: function(){
    var amount = option.input;
    var submitBtn = option.trigger;
    var _disableSubmit = function(msg){
      if ( msg ) {
        $(amount).parent().siblings('.help-inline').empty().removeClass('success-msg info-msg')
      .addClass('error-msg').append(msg);
      }
      $(submitBtn).prop('disabled', true);
    };
    var _enableSubmit = function(){
      $(submitBtn).prop('disabled', false);
    };
    $(amount).on('keyup keydown', function(e){
      var keynum;
      if(window.event){
        keynum = e.keyCode;
      }else if(e.which){
        keynum = e.which;
      }
      if(keynum == 32){
        return false;
      }
    });
    $(amount).on('keyup blur', function(){
      var iptVal = $(this).val();
      if(!$(this).valid()){
        return _enableSubmit();
      }
      if ( !iptVal.length ) {
        return _enableSubmit();
      }
      if(isNaN(iptVal)){
        _disableSubmit(ErrMsg.isNumber);
        return false;
      }
      iptVal = iptVal - 0 || 0;
      if( iptVal < 1 ){
        _disableSubmit(ErrMsg.rechargeError);
        return false;
      }
      return _enableSubmit();
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'input', 'trigger', 'smscode'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.amount();
    me.compar();
    me.smsCode();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = gatewayCharge;
