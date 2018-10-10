'use strict';

var loanBuyConfirm = {
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
  checkboxChecked: function(){
    $('#J_submit').on('change', function(){
      var temp = $('#J_submit').is(':checked');
      if(!temp){
        $('#J_btn-buy-confirm').attr('disabled', 'disabled');
        return false;
      }
      $('#J_btn-buy-confirm').removeAttr('disabled');
    });
  },
  init: function(){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    me.checkboxChecked();
  }
};

exports = module.exports = loanBuyConfirm;