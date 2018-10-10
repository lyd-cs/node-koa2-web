'use strict';

var helpQuestion = {
  questionTab: function(){
    $('.J_question-list').on('click', function(){
      var $link = $(this).data('link');
      $(this).find('a').addClass('active');
      $(this).siblings().find('a').removeClass('active');
      $($link).removeClass('hide').siblings('.help-science-list').addClass('hide');
    });
  },
  questionTitle: function(){
    $('.J_question-title').on('click', function(){
      $(this).find('.answer-content').addClass('J_active').slideToggle();
    });
    $('.J_pack-up').on('click', function(){
      $(this).parent().slideUp();
    });
  },
  detailBack: function(){
    $('.J_help-detail-back').click(function(){
      window.history.back();
    });
  },
  init: function(){
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.questionTab();
    me.questionTitle();
    me.detailBack();
    return me;
  }
};

exports = module.exports = helpQuestion;