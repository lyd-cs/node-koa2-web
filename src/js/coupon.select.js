'use strict';

var selectCoupon = {
  moreCouponShow: function(){
    $('.J_more-coupon').on('click', function(){
      $('.J_coupon-more-item').toggle();
    });
  },
  selectCoupon: function(){
    $('.J_coupon-list').on('click', '.J_coupon-item', function(){
      if (!$(this).data('disabled')){
        return;
      }
      $('input').val($(this).data('id'));
    });
  },
  init: function(){
    var me = this;
    if (!!me._init){
      return me;
    }
    me.moreCouponShow();
    me.selectCoupon();
    me._init = true;
    return me;
  }
};

exports = module.exports = selectCoupon;