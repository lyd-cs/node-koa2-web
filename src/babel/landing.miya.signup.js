'user strict';

// import util from './util';
let landingSignupStep = require('./landing.signup.step');
var {trackEvent} = require('./statistics');

function baiduTrackEvent(action) {
  var utmSource = $('input[name="utmSource"]').val();
  trackEvent(utmSource, action);
}

var landingMiyaSignup = {
  stepMobileShow: function() {
    $('.J_landing-miya-signup-packet-banner').addClass('hide');
    $('.J_landing-miya-signup-step1-banner, #J_register-form, .J_landing-miya-product').removeClass('hide');
  },

  escrowBtnShow: function(){
    var btnOffsetTop = $('#J_btn-invite-submit').offset().top;
    var btnScrollTop = $(document).scrollTop();
    if(btnOffsetTop <= btnScrollTop && btnScrollTop > 400){
      $('.J_landing-miya-signup-button').removeClass('hide');
    }else{
      $('.J_landing-miya-signup-button').addClass('hide');
    }
  },

  openPacket: function(){
    var me = this;
    $('.J_receive-packet-content').on('click', function() {
      baiduTrackEvent('kai');
      $(this).addClass('opening-packet');
      setTimeout(function(){
        me.stepMobileShow();
      }, 1500);
    });
  },

  init: function(opt){
    var me =this;
    if (!!me._init) {
      return me;
    }
    let option = $.extend({}, opt, {successCallback: function(){
      $('#J_landing-signup-result').removeClass('hide').siblings('#J_landing-wrap').addClass('hide');
    }});
    landingSignupStep.init(option);
    me.openPacket();
    $(document).on('scroll', function(){
      me.escrowBtnShow();
    });
    me._init = true;
    return me;
  }
};

exports = module.exports = landingMiyaSignup;