'use strict';

var nothing_tpl = require('./tpl/nothing.data.pug');
var option;
var exchange_coupon = require('./tpl/coupon.exchange.pug');
var defaultOptions = {
  couponList: '.J_coupon-content',
  targetContainer: '.J_uc-coupon-list'
};
var $modal;

var accountCoupon = {
  couponList: function(){
    var me = this;
    $('.J_coupon-category').on('click', 'a', function(){
      var type = $(this).data('type');
      var data = {
        type: type
      };
      $(this).addClass('active').parent().siblings().find('a').removeClass('active');
      me.send(data);
    });
  },
  couponPagerList: function(){
    var data;
    var currentPage;
    var me = this;
    var $currentCoupon;
    var type;
    // var paginationData;
    var targetContainer = option.targetContainer;
    $(targetContainer).on('click', '.page-btn', function(){
      $currentCoupon = $('.J_coupon-category').find('.active');
      currentPage = $(this).data('page');
      // paginationData = $('.pagination').data('page');
      type = $currentCoupon.data('type');
      data = {
        pageNumber: currentPage,
        type: type
      };
      // if (paginationData == currentPage) {
      //   return false;
      // }
      me.send(data);
    });

  },
  send: function(data){
    $.post('/api/couponList', data)
      .done(function(json){
        if (!json.data.html){
          $(option.couponList).html(nothing_tpl());
          return;
         }
         $(option.couponList).html(json.data.html);
      }).fail(function(){
        $(option.couponList).html(nothing_tpl());
      });
  },
  renderExchangeModal: function(){
    $modal = $(exchange_coupon());
    $modal.appendTo(document.body);
  },
  bindExchange: function(){
    var me = this;
    $('.J_exchange-coupon').on('click', function(){
      if ($modal){
        $modal.modal('show');
        return;
      }
      me.renderExchangeModal();
      $modal.modal('show');
    });
  },
  init: function(opt){
    var me = this;
    if (!!me._init){
      return me;
    }
    option = $.extend({}, defaultOptions, opt);;
    me.couponList();
    me.couponPagerList();
    me.renderExchangeModal();
    me.bindExchange();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountCoupon;

