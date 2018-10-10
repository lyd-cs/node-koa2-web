var accounting = require('accounting');
var Form = require('./form');
var ErrMsg = require('../../lib/errormsg');

exports.reAmount = /^(?:[1-9][0-9]*)0{3}$/;
exports.reMobile = /^1[3|4|5|6|7|8|9][0-9]{9}$/;
exports.reNickName = /^[\u4E00-\u9FA5A-Za-z0-9_]{2,12}$/;
exports.reMobileReplace = exports.mobileReplace = /^(\d{3})(.*)(\d{4})$/;
exports.reRealnameReplace = /^(.*)(.{1})$/;
exports.reBankCardNo = /^\d{16,30}$/;
exports.reCash = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
exports.reRealMinorityName = /^([\u4e00-\u9fa5]+(·[\u4e00-\u9fa5]+)*){2,20}$/;
exports.checkPassword = /^((([a-z]+[0-9]+)|([0-9]+[a-z]+))[a-z0-9]*)+$/i;
exports.checkIdentityCard = /^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)?$/i;
exports.blendPwd = /^[A-Za-z0-9]+$/;
exports.reTradPwd = /^\d{6}$/;
exports.checkCouponCode = /^[a-z0-9A-Z]+$/i;
// format money
accounting.settings.currency.format = '%v';
exports.accounting = accounting;
exports.toFixed = accounting.toFixed;
exports.formatNumber = accounting.formatNumber;
exports.formatMoney = accounting.formatMoney;

exports.Form = Form;
exports.ErrMsg = ErrMsg;
exports.bankCodeList  = ['0160', '0150', '0210', '0220', '5006', '5004', '5009', '5005', '5010', '5012', '5003', '0201', '5007', '5000', '5002', '5008'];



/**
 * safe mobile
 */
exports.safeMobile = function(val){
  if ( !val || val.length < 7 ) {
    return '****';
  }
  return val.replace(exports.mobileReplace, '$1****$3');
};
// safe realname
exports.safeRealname = function(val){
  if (!val){
    return '**';
  }
  return val.replace(exports.reRealnameReplace, '*$2');
};
