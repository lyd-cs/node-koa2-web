'use strict';

var enterpriseRecharge = {
  formSubmit: function(){
    $('.J_recharge-form').on('submit', function(e){
      var amount = $('input[name=amount]').val();
      var exp = /^(0|[1-9]\d*)(\.\d{1,2})?$/;
      var $errorTips = $('.J_help-inline');
      if (!exp.test(amount)) {
        $errorTips.html('请输入正确的充值金额');
        e.preventDefault();
        return;
      }
      $errorTips.html('');
    });

  },
  init: function(){
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.formSubmit();
    me._init = true;
    return me;
  }
};

exports = module.exports = enterpriseRecharge;