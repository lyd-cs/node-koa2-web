'use strict';

function topFixed(){
  var scrollTop = $(window).scrollTop();
  var footerTop = $('.footer').offset().top;
  var footerBottom = footerTop - scrollTop - $(window).height();
  var footerPadding = 65;
  var sectionMarginBottom = 40;
  var udeskBottom = 122;
  var backTopBottom = 20;
  var udeskFixedBottom = 102;
  var footerHeight = $('.footer').height() + footerPadding;
  if(scrollTop > 0){
    $('#J_icon-scroll-top').removeClass('icon-hide');
    if(footerBottom <= 20){
      $('#J_icon-scroll').css({'position': 'absolute', 'bottom': (footerHeight + sectionMarginBottom) + 'px'});
      $('#udesk_btn a').css({'position': 'absolute', 'bottom': (footerHeight + udeskBottom) + 'px'});
      return;
    }
    $('#J_icon-scroll').css({'position': 'fixed', 'bottom': backTopBottom + 'px'});
    $('#udesk_btn a').css({'position': 'fixed', 'bottom': udeskFixedBottom + 'px'});
    return;
  }
  $('#J_icon-scroll-top').addClass('icon-hide');
}

var backTopAction = {
  scroll: function(){
    $(window).on('scroll', topFixed);
  },
  goTop: function(){
    $('#J_icon-scroll-top').on('click', function(){
      $('html, body').animate({
        scrollTop: 0
      }, 250);
    });
  },
  init: function(){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    me.scroll();
    me.goTop();
    me._init = true;
    return me;
  }
};

exports = module.exports = backTopAction;

