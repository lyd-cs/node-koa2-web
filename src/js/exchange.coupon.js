'use strict';

var util = require('./util');
var ErrMsg = require('../../lib/errormsg.js');
var _tpl_exchange = require('./tpl/coupon.exchange.code.pug');
var _tpl_exchange_success = require('./tpl/coupon.exchange.success.pug');
var couponList = require('./account.coupon.js');
var defaultOptions = {
  modalContainer: '.J_modal-contaniner',
  exchangeModal: '.J_modal-exchange-coupon',
  successBtn: '.J_exchange-success-btn'
};
var $el = {};
var option;
var data = {};
var isSubmitting = false;

function accountCouponListRefresh(){
  var currentPage = $('.pagination').find('.pages-active').find('a').data('page');
  var currentTabType = $('.J_coupon-category').find('.active').data('type');
  if (currentPage) {
    data.pageNUmber = currentPage;
  } else {
    data.pageNUmber = 1;
  }
  data.type = currentTabType;
  couponList.send(data);
};

function productCouponListRefresh(){
  var couponActive = $('input[name=couponId]').val();
  data = {
    bidAmount: option.buyResultBidAmount,
    productId: option.productId,
    couponId: couponActive
  };
  $.post('/api/plan/couponList', data)
    .done(function(json){
      if (json.status !== 0) {
        return false;
      }
      $('#J_content').find('.J_coupon-more').removeClass('hide');
      $('.J_coupon-more-list').html(json.data.html).removeClass('hide');
      $('.J_more-coupon').find('i').remove();
      $('.J_more-coupon').append('<i class="fa fa-angle-down"></i>');
    });
}

//clear input value
function reset(){
  $el.modalContainer.find('.J_coupon-code').val('');
  $el.modalContainer.find('.J_error-tips').removeClass('error-icon').html('');
}

var exchangeCoupon = {
  focusExchange: function(){
    $('.J_modal-contaniner').on('focus', '.J_coupon-code', function(){
      var $prevSibling = $(this).prevAll();
      $prevSibling.each(function(){
        if ($(this).val().length < 4){
          $(this).focus();
          return;
        }
      });
    }).on('keyup', '.J_coupon-code', function(){
      var _iptVal = $(this).val().length;
      var $_nextIpt = $(this).next('input');
      var $_prevIpt = $(this).prev('input');
      if (_iptVal >= 4 && $_nextIpt) {
        $_nextIpt.focus();
      }
      if (_iptVal <= 0 && $_prevIpt) {
        $_prevIpt.focus();
      }
    });
  },
  modalHide: function(){
    $el.modalContainer.on('click', '.J_close-button', reset);
  },
  bindEvent: function(){
    var me = this;
    $el.modalContainer.on('click', '#J_submit-btn', function(){
      var $exchangeIpt = $el.modalContainer.find($('.J_coupon-code'));
      var $couponErrorTips = $el.modalContainer.find($('.J_error-tips'));
      var _iptVal;
      var _exchangeVal;
      $exchangeIpt.each(function(){
        _iptVal = $(this).val();
        if (!_exchangeVal){
          _exchangeVal = _iptVal;
        } else {
          _exchangeVal = _exchangeVal + _iptVal;
        }
      });
      if (!_exchangeVal){
        $couponErrorTips.addClass('error-icon').html(ErrMsg.isEmptyCouponCode);
        return false;
      }
      if (!util.checkCouponCode.test(_exchangeVal)){
        $couponErrorTips.addClass('error-icon').html(ErrMsg.isCouponCode);
        return false;
      }
      if (isSubmitting) {
        return fasle;
      }
      _exchangeVal = _exchangeVal.toUpperCase();
      isSubmitting = true;
      me.send(_exchangeVal);
    });
  },
  send: function(couponCode){
    var $couponErrorTips = $el.modalContainer.find($('.J_error-tips'));
    $.post('/api/exchangeCoupon', {code: couponCode})
      .done(function(json){
        var action = $('input[name=action]').val();
        isSubmitting = false;
        if (json.status !== 0){
          $couponErrorTips.addClass('error-icon').html(json.message);
          return;
        }
        reset();
        $couponErrorTips.removeClass('error-icon').html('');
        $el.modalContainer.html(_tpl_exchange_success({
          coupon: json.data.coupon
        }));
        if (action == 'account') {
          accountCouponListRefresh();
        }
        if (action == 'buy') {
          productCouponListRefresh();
        }
        $('.J_modal-contaniner').on('click', '.J_exchange-success-btn', function(){
          $('.J_modal-exchange-coupon').modal('hide');
          $el.modalContainer.html(_tpl_exchange);
        });
      }).fail(function(){
        isSubmitting = false;
      });
  },
  init: function(opt){
    var me = this;
    if (!!me._init){
      return me;
    }
    option = $.extend({}, defaultOptions, opt);
    $.each(['modalContainer', 'exchangeModal', 'successBtn'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bindEvent();
    me.modalHide();
    me.focusExchange();
    me._init = true;
    return me;
  }
};

exports = module.exports = exchangeCoupon;