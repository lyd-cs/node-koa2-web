'user strict';

var scrollPosition = {
  setPosition: function(){
    $('#J_scroll').scrollLeft($('.native').position().left - 125);
  },
  init: function(){
    var me = this;
    me.setPosition();
  }
};

exports = module.exports = scrollPosition;