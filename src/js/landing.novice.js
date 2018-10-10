'use strict';

var iconScrollFlag;
var novice = {
  bindEvent: function(){
    var me = this;
    $('.J_novice-why-controller').on('mouseover', '.J_icon-container', function(e){
      e.stopPropagation();
      clearInterval(iconScrollFlag);
      var hoverController = this;
      me.change(hoverController);
    });
    $('.J_novice-why-controller').on('mouseout', '.J_icon-container', function(e){
      e.stopPropagation();
      clearInterval(iconScrollFlag);
      me.autoScroll($(this).index() + 1);
    });
  },
  autoScroll: function(flag){
    var me = this;
    var iconControllers = ['bank', 'risk', 'disperse'];
    var actController;
    var count = flag;
    iconScrollFlag = setInterval(function(){
      if(count >= iconControllers.length){
        count = 0;
      }
      actController = $('[data-flag='+iconControllers[count]+']');
      me.change(actController);
      count = count+1;
    }, 5000);
  },
  change: function(handler){
    var arrowPosition = $(handler).position().left + $(handler).width() / 2 - 10;
    var controllerFlag = $(handler).data('flag');
    $('.J_novice-why-controller, .J_novice-why-detail').find('.active').removeClass('active');
    $(handler).find('.J_icon-active').addClass('active');
    $('.J_icon-arrow').css('left', arrowPosition+'px');
    $('.J_novice-why-detail').find('.J_'+controllerFlag).addClass('active');
  },

  init: function(){
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.bindEvent();
    me.autoScroll(1);

    me._init = true;
    return me;
  }

};

exports = module.exports = novice;