'user strict';

import util from './util';
let landingSignup = require('./landing.signup');

var landingOrdinary = {
  openOrDownloadApp: function() {
    $('.J_android').on('click', function() {
      app.judgeInstallApp.openOrDownloadApp();
    });
  },
  init: function(opt){
    var me =this;
    if (!!me._init) {
      return me;
    }
    let option = $.extend({}, opt, {success: function(){
      $('#J_result').removeClass('hide').siblings('#J_wrap').addClass('hide');
      if (util.isIos()) {
        $('.J_android').addClass('hide');
      } else {
        $('.J_ios').addClass('hide');
      }
    }});
    landingSignup.init(option);
    me.openOrDownloadApp();
    me._init = true;
    return me;
  }
};

exports = module.exports = landingOrdinary;