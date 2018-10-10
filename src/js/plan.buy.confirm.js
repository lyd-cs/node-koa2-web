
var confirmSubmit = $('.plan-buy-confirm-btn');
var agreeParent = $('.loan-buy-confirm-check');
var confirmAgree = $('#J_submit');

var planBuyConfirm =  {
  checkAgree: function() {
    agreeParent.on('click', function() {
      if (confirmAgree.prop('checked')) {
        confirmSubmit.attr('disabled',false);
      }else {
        confirmSubmit.attr('disabled',true);
      }
    });
  },
  submitHandle: function() {
    confirmForm.on('submit',function(event) {
      if (submitting || timer){
        event.preventDefault();
        clearInterval(timer);
        timer = null;
        return false;
      }
      submitting = true;
      timer = setTimeout(function() {
        submitting = false;
      },duration);
    });
  },
  init: function() {
    var me = this;
    me.checkAgree();
  }
};

exports = module.exports = planBuyConfirm;
