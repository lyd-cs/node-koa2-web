'user strict';

let landingSignupStep = require('./landing.signup.step');

var landingWeishaRegister = {
  init: function(opt){
    var me =this;
    if (!!me._init) {
      return me;
    }
    let option = $.extend({}, opt, {successCallback: function(){
      $('#J_landing-signup-result').removeClass('hide').siblings('#J_landing-wrap').addClass('hide');
    }});
    landingSignupStep.init(option);
    me._init = true;
    return me;
  }
};

exports = module.exports = landingWeishaRegister;