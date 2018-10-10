'user strict';

var aboutPlatform = {
  tipsClick: function(){
    $('#J_about-plastform-borrow-tips').click(function(){
      $('#J_about-platform-relation-modal').addClass('about-platform-modal-in');
    });
    $('#J_about-plastform-count-tips').click(function(){
      $('#J_about-platform-count-modal').addClass('about-platform-modal-in');
    });
    $('.J_about-platform-circle').click(function(){
      $('.about-platform-modal-wrap').removeClass('about-platform-modal-in');
    });
    $('.about-platform-modal-wrap').click(function(event) {
      if ($(event.target)[0] == $(this)[0]) {
        $(this).removeClass('about-platform-modal-in');
      }
    });
  },
  init: function(){
    var me = this;
    me.tipsClick();
  }
};

exports = module.exports = aboutPlatform;