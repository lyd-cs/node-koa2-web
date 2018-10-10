'use strict';

var modal_tpl = require('./tpl/signup.success.pug');
var home = {
  slider: function() {
    $('#J_carousel-generic').carousel().find('.item:not(.active)').each(function() {
      var url = $(this).data('origin');
      $(this).css('background-image', 'url(' + url + ')');
    });
  },
  signupSuccessModal: function(opt) {
    var _signupSuccess = opt.signupSuccess;
    var _username = opt.username;
    var $modal;
    if (_signupSuccess) {
      $modal = $(modal_tpl({
        username: _username
      }));
      $modal.appendTo('#J_signup-success').modal('show');
    }
  },
  announce: function() {
    $('#J_announce').on('click', function() {
      if ($('#J_announce-body').hasClass('home-announce-hide')) {
        $('#J_announce-body').slideDown(200, function() {
          $(this).removeClass('home-announce-hide');
        });
        return;
      }
      $('#J_announce-body').slideUp(200, function() {
        $(this).addClass('home-announce-hide');
      });
    });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.slider();
    me.announce();
    me.signupSuccessModal(opt);
    me._init = true;
    return me;
  }
};

exports = module.exports = home;
