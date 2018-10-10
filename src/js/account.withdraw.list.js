'use strict';

var withdrawList = {
  showProgress: function(){
    $('#J_withdraw-list').on('click', '.examine', function(e){
      var $list = $(e.target).parents('.withdraw-list-body');
      var $progress = $list.next('.withdraw-list-progress');
      var progressShow = $progress.data('show') - 0;
      if(!progressShow){
        $progress.slideDown(200, function(){
          $list.addClass('withdraw-list-rise').find('span').addClass('release');
          $progress.addClass('withdraw-list-progress-rise').show();
          $progress.data('show', '1');
        });
        return;
      }
      $progress.slideUp(200, function(){
        $list.removeClass('withdraw-list-rise').find('span').removeClass('release');
        $progress.removeClass('withdraw-list-progress-rise').hide();
        $progress.data('show', '0');
      });
    });
  },
  init: function(){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    me.showProgress();
    me._init = true;
    return me;
  }
};

exports = module.exports = withdrawList;

