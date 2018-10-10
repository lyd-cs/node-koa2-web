/**
 * gateway charge
 */
var util = require('./util');
var ErrMsg = util.ErrMsg;

var _tpis_tpl = require('./tpl/bank.limit.record.pug');
var Form = util.Form;


var $el = {};
var defaultOption = {
  form: '#J_recharge-form'
};

var option;
function showModal(){
  $('#J_payModal').modal({
    show: true,
    backdrop: 'static'
  });
}
function bindValidate(form, options){
  var opt;
  if ( !form || !!form._bindValidate ) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    rules:{
      amount: {
        required: true
      }
    },
    messages:{
      amount: {
        required: ErrMsg.isEmptyCharge
      }
    },
    success: function(msg, el){
      $(el).parent().siblings('.help-inline').empty();
    },
    submitHandler: function(form) {
      showModal();
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
  quotaTips: function(){
    var me = this;
    $('.J_bank-radio').on('click', function(){
      var $input = $(this);
      var ebankLable = $input.parents('.ebank-label');
      ebankLable.addClass('bank-active').children('.icon-bank-radio').addClass('icon-bank-radio-check');
      ebankLable.siblings().removeClass('bank-active').children('.icon-bank-radio').removeClass('icon-bank-radio-check');
      $('.J_bank-radio').removeAttr('checked');
      $input.attr('checked','checked');
      _bankId = $input.val();
      me.loadBankLimitData(_bankId);
      $('#J_bank-limit').height(($('#J_limit-title').height())||0);
      $('#J_ebank-code').val(_bankId);
    });
  },
  defaultTips: function(){
    var me = this;
    var _bankId = $('#J_ebank-code').val();
    if(_bankId) {
      $('.J_bank-radio').each(function(){
        var $input = $(this);
        if($input.attr('data-bankcode') === _bankId){
          $input.trigger('click', function(){
            me.loadBankLimitData(_bankId);
           });
        }
      });
    }
  },
  loadBankLimitData: function(_bankId){
    var _bankLimitList = option.bankLimitList;
    $('#J_bank-limit').html(_tpis_tpl({
      bankId: _bankId,
      bankLimitList: _bankLimitList
    }));
  },
  amount: function(){
    $('#J_amount').keyup(function(){
      var value = $(this).val().replace(/^(\-)*(\d+)\.(\d\d).*$/,'$1$2.$3');
      $(this).val(value);
    });
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
    $(amount).on('keyup blur', function(){
      var iptVal = $(this).val();
      if(!$(this).valid()){
        return _enableSubmit();
      }
      if ( !iptVal.length ) {
        return _enableSubmit();
      }
      iptVal = iptVal - 0 || 0;
      if( iptVal < 1 ){
        _disableSubmit(ErrMsg.rechargeError);
        return false;
      }
      return _enableSubmit();
    });
  },
  moreBankBtn: function(){
    var moreBankBtn = option.onload;
    $(moreBankBtn).on('click', function(){
        $(moreBankBtn).parent('.ebank-more-btn').siblings().removeClass('bank-display-status');
        $(moreBankBtn).parent('.ebank-more-btn').addClass('no-border').hide();
        var bankListHeight = $('.J_banklist-wrap').height();
        $('.J_banklist').height(bankListHeight);
    });
  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form', 'input', 'trigger', 'onload', 'bankLimitList'], function(k, v){
      $el[v] = $(option[v]);
    });

    me.amount();
    me.compar();
    me.quotaTips();
    me.defaultTips();
    me.moreBankBtn();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = gatewayCharge;
