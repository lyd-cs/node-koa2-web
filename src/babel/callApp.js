'user strict';

import interactiveBridge from './interactiveBridge';

var callApp = {
  jumpToApp: function() {
    var bridge = app.util.webviewBridge;
    $('.J_jump-to-app').on('click', function() {
      var _path = $(this).data('path');
      var _productId = $(this).data('productid') || '';
      bridge.callHandler('startPage', {
        path: _path,
        productId: _productId
      });
    });
  },
  jumpH5ToApp: function() {
    $('.J_jump-webpage-to-app').on('click', function() {
      interactiveBridge.openAppH5Page({
        path: $(this).data('path'),
        title: $(this).data('title')
      });
    });
  },
  init: function() {
    var me = this;
    me.jumpToApp();
    me.jumpH5ToApp();
  }
};

exports = module.exports = callApp;