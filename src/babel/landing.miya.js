'user strict';

import interactive from './interactiveBridge.js';
var {trackEvent} = require('./statistics');

var defaultOption ={};
var option;

var miyaActive = {
  escrow: function() {
    $('.J_notify-to-app').on('click', function(){
      if (option.isEscrow) {
        interactive.showMessage({
          type: 'toast',
          message: '您已成功开户，蜜芽券会以短信的形式发送至您的注册手机号，请注意查收。'
        });
      } else {
        interactive.openAppPage({
          path: '/home/EscrowActivity'
        });
      }
    });
  },
  activeHandle: function() {
    if (option.isNotMiyaActiveUser) {
      trackEvent('Group5', 'isNotMiyaUser', '蜜芽活动-H5');
      $('#J_riskvail-test-result').addClass('riskvail-modal-in');
      $('.J_riskvail-modal-btn-retry').on('click', function(){
        interactive.openAppPage({
          path: '/home/main'
        });
      });
    }else {
      trackEvent('Group5', 'isMiyaUser', '蜜芽活动-H5');
    }
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    me.escrow();
    me.activeHandle();
    me._init = true;
    return me;
  }
};

exports = module.exports = miyaActive;