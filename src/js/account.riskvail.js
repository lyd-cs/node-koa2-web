/**
 * account riskvail
 */
'use strict';

var _tpl_Account_Riskvail = require('./tpl/account.riskvail.modal.pug');
var lastPage = '';

var account_riskvail = {
  defaultScoreDetail: function(len) {
    len = len || 8;
    var scoreStr = '';
    for (var i = 0; i < len; i++) scoreStr += '0, ';
    return scoreStr.slice(0, -2);
  },
  skipTest: function(){
    var me = this;
    $('.uc-riskvail-skip').on('click', function(){
      $('.skipmodal').modal();
    });
    $('.riskmodal-btn-skip').on('click', function(){
      var data = {
        score: 0,
        scoreDetail: me.defaultScoreDetail(me.getQuestions().allQuestionsLen)
      };
      me.sendCore(data);
    });
    $('.riskmodal-btn-cancel').on('click', function(){
      $('.skipmodal').modal('hide');
    });
  },
  riskvail: function(type) {
    $('#risk-result-modal').html(_tpl_Account_Riskvail()).modal();
    $('#invest-type').html(type);
    $('.riskmodal-btn-comfirm').on('click', function(){
      window.location.href = lastPage;
    });
  },
  sendCore: function(data){
    var me = this;
    $.post('/api/account/riskvail', data)
      .done(function(json){
        if (json.status != 0){
          alert(json.message);
          return;
        }
        if(data.skip){
          me.riskvail(data.riskType);
          return;
        }
        window.location.href = lastPage;
      });
  },
  getQuestions: function() {
    return {
      checkedQuestions: $('.uc-riskvail-question[checked]'),
      allQuestionsLen: $('.uc-riskvail-question').length
    };
  },
  getCheckedDetail: function(questions) {
    questions = questions || {};
    var checkedQuestions = questions.checkedQuestions;
    var allQuestionsLen = questions.allQuestionsLen;
    var scoreDetail = [],
        score = 0;
    if (!checkedQuestions.length || checkedQuestions.length !== allQuestionsLen) {
      return {
        isAllQuestionChecked: false
      };
    }
    for (var i=0; i<allQuestionsLen; i++) {
      var scoreItem = checkedQuestions.eq(i).data('score');
      score += scoreItem;
      scoreDetail.push(scoreItem);
    }

    return {
      totalScore: score,
      isAllQuestionChecked: true,
      scoreDetail: scoreDetail.join()
    };
  },
  cal:function(){
    var me = this;
    $('li').click(function() {
      var self = $(this);
      self
        .prevAll('h5').removeClass('hasNoCheck')
        .parent().data({
        'score': self.find('input')[0].value - 0,
        'checked': true,
      }).attr('checked', true);
    });
    $('.uc-riskvail-btn-submit').on('click', function(){
      var type = '';
      var checkedDetail = me.getCheckedDetail(me.getQuestions());
      //先判断是否全选，不全选的话直接阻止
      if(!checkedDetail.isAllQuestionChecked){
        var uncheckElem = $('.uc-riskvail-question')
          .not('[checked]')
          .find('h5')
          .addClass('hasNoCheck')
          .first();
        $('html, body').animate({
          scrollTop: uncheckElem.offset().top - 30
        }, 200);
        return false;
      }
      // 获取分数
      var score = checkedDetail.totalScore;
      switch (true){
        case score <= 14:
          type = '保守型';
          break;
        case score > 14 && score <= 36:
          type = '稳健型';
          break;
        case score>36:
          type = '积极应对型';
          break;
        default:
          type = '保守型';
      }
      var data = {
        score: score,
        riskType: type,
        skip: 1,
        scoreDetail: checkedDetail.scoreDetail
      };
      me.sendCore(data);
    });
  },
  init: function(opt){
    var me = this;
    lastPage = opt.url;
    me.cal();
    me.skipTest();
  }
};

exports = module.exports = account_riskvail;
