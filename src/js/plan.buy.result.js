var submitting = false;
var timer = null;
var duration = 5000;
var planBuyConfirm =  {
  init: function() {
    $('.plan-buy-confirm-btn').on('submit',function(event) {
      var me = this;
      if (submitting || timer){
        event.preventDefault();
        clearInterval(timer);
        timer = null;
        return false;
      }
      submitting = true;
      $(this).prop(disabled,true);
      timer = setTimeout(function() {
        submitting = false;
        $(me).prop(disabled, false);
      },duration);
    });
  }
};

exports = module.exports = planBuyConfirm;
