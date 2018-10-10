'user strick';

var $el = {};
var util = require('./util');
var ErrMsg = util.ErrMsg;
var defaultOptions = {};
var lastCheckBankNumber;

function showBankLimit(obj){
  if(obj.quotaStatus == '2'){
    return '银行系统维护中';
  }else{
    var limitSingle = obj.single ? '单笔' + obj.single : '';
    var limitDay = obj.day && obj.single ? ' ，单日' + obj.day : obj.day ? '单日' + obj.day : '';
    return limitSingle + limitDay;
  }
}

function showBankName(json) {
  var prevBankCode = $($el.bankcode).val();
  var bankTips = $el.banktips;
  if (json.data.bankCode in bankTips.get(0)) {
    $el.showbankname.removeClass('select-bank-' + prevBankCode).addClass('select-bank-' + json.data.bankCode);
    $el.bankname.val(bankTips[0][json.data.bankCode].name).addClass('select-bank-item');
    $el.bankcode.val(json.data.bankCode);
    $el.banklimit.html('').html(showBankLimit(bankTips[0][json.data.bankCode]));
    $el.banknumber.removeClass('input-error');
    $el.bankerror.html('');
  }
  $el.banknumber.data('passed', '1');
}

function emptyBankName() {
  var bankCode = $($el.bankcode).val();
  $el.showbankname.removeClass('select-bank-' + bankCode);
  $el.bankname.val('').removeClass('select-bank-item');
  $el.banklimit.html('');
  $el.bankcode.val('');
}

function bankNumberTypeError() {
  $el.banknumber.addClass('input-error');
  $el.bankerror.html(ErrMsg.isDebitBankCard);
  emptyBankName();

}

// function bankNumberError() {
//   $el.banknumber.addClass('input-error');
//   $el.bankerror.html(ErrMsg.isBankNumber);
//   emptyBankName();
// }

var bankNumberChecked = {
  send: function() {
    var currentCheckBankNumber =$el.banknumber.val();
    // if (currentCheckBankNumber && lastCheckBankNumber && lastCheckBankNumber == currentCheckBankNumber) {
    //   return;
    // }
    if (!currentCheckBankNumber) {
      $el.banknumber.addClass('input-error');
      $el.bankerror.html(ErrMsg.isBankIdEmpty);
      emptyBankName();
      return false;
    }
    $el.banknumber.data('passed', '0');
    lastCheckBankNumber = currentCheckBankNumber;
    $.post('/api/bankcard/checked', {banknumber: lastCheckBankNumber})
      .done(function(json){
        if (json.status !== 0){
          $el.banknumber.addClass('input-error');
          $el.bankerror.html(json.message);
          emptyBankName();
          return false;
        }
        if (json.data.cardType == 'credit') {
          bankNumberTypeError();
          return false;
        }
        showBankName(json);
        }).fail(function(){
          return false;
        });
  },
  bindEvent: function(){
    var me = this;
    $($el.banknumber).on('blur', function(){
      me.send();
    });
  },
  init: function(opt) {
    var me = this;
    var option = $.extend({}, defaultOptions, opt);
    $.each(['banknumber', 'bankname', 'bankcode', 'banklimit', 'bankerror', 'showbankname', 'banktips'] ,function(k, v){
      $el[v] =$(option[v]);
    });
    me.bindEvent();
  }
};

exports = module.exports = bankNumberChecked;