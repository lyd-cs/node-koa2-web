'user strict';

var questions = {
  collapse: function(){
    var me = this;
    $('.J_title').click(function(){
      me.toggleDetail($(this).children(':first'), 'rotate');
      me.slideDetail($(this).siblings('.J_detail'), 'fast');
    });
  },
  toggleDetail: function($el, className){
    $el.toggleClass(className);
  },
  slideDetail:function($el, speed){
    $el.slideToggle(speed);
  },
  showTab: function($el) {
    var $this = $el || $(this);
    $this.addClass('active').siblings().removeClass('active');
    $($this.data('link')).addClass('show').siblings().removeClass('show');
  },
  switchtabs:function(){
    var me = this;
    $('.questions-tabs').on('click', '.J_questions-tabs-item', function() {
      me.showTab.call(this);
    });
  },
  defaultAction: function() {
    var me = this;
    var defaultTab = location.hash;
    if (defaultTab) {
      me.showTab($('[data-link='+defaultTab+']'));
    }
  },
  init: function(){
    var me = this;
    me.collapse();
    me.switchtabs();
    me.defaultAction();
  }
};

exports = module.exports = questions;