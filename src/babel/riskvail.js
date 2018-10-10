/* eslint-disable no-unused-vars,semi */
/**
 * h5 riskvail
 */
'use strict';

var riskvail = {
  defaultScoreDetail: function(len) {
    len = len || 8;
    let scoreStr = '';
    for (var i = 0; i < len; i++) scoreStr += '0, ';
    return scoreStr.slice(0, -2);
  },

  skipRiskvail: function() {
    let me = this;
    const bridge = app.util.webviewBridge;
    bridge.registerHandler('skipTest', function() {
      me.openModal({
        modalId: '#J_riskvail-skip-test',
        riskType: '保守型'
      });
    });
  },

  openModal: function(opt) {
    let modalId = opt.modalId || '';
    let riskType = opt.riskType || '保守型';
    $(modalId).addClass('riskvail-modal-in').on('touchmove', function(e) {
      e.preventDefault();
    });
    $(modalId).find('.J_risktype').text(riskType);
  },
  closeModal: function() {
    $('#J_riskvail-test-result, #J_riskvail-skip-test').removeClass('riskvail-modal-in');
  },
  sendData: function(data) {
    let me = this;
    $.post('/api/riskvail', data)
      .done(function(json) {
        if (json.status != 0) {
          $('.J_riskvail-errinfo').html(json.message);
          return;
        }
        if(!data.skip){
          me.openModal({
            modalId: '#J_riskvail-test-result',
            riskType: data.riskType
          });
        }else{
          me.sendToApp();
        }
      }).fail(function(xhr,err) {
      $('.J_riskvail-btn-submit').data('init', 0);
      $('.J_riskvail-errinfo').html('服务异常，请重新登录！');
    });
  },
  sendToApp: function() {
    const bridge = app.util.webviewBridge;
    bridge.callHandler('riskEvaluation');
  },
  getQuestions: function() {
    return {
      checkedQuestions: $('.riskvail-question[checked]'),
      allQuestionsLen: $('.riskvail-question').length
    };
  },
  getCheckedDetail: function(questions) {
    questions = questions || {};
    let checkedQuestions = questions.checkedQuestions;
    let allQuestionsLen = questions.allQuestionsLen;
    let scoreDetail = [],
      score = 0;
    if (!checkedQuestions.length || checkedQuestions.length !== allQuestionsLen) {
      return {
        isAllQuestionChecked: false
      };
    }
    for (var i=0; i<allQuestionsLen; i++) {
      let scoreItem = checkedQuestions.eq(i).data('score');
      score += scoreItem;
      scoreDetail.push(scoreItem);
    }

    return {
      totalScore: score,
      isAllQuestionChecked: true,
      scoreDetail: scoreDetail.join()
    };
  },
  calculate: function(){
    let me = this;
    let type = '';
    let checkedDetail = me.getCheckedDetail(me.getQuestions());
    //先判断是否全选，不全选的话直接阻止
    if(!checkedDetail.isAllQuestionChecked){
      let uncheckElem = $('.riskvail-question')
        .not('[checked]')
        .find('h5')
        .addClass('option-no-checked')
        .first();
      $('html, body').animate({
        scrollTop: uncheckElem.offset().top - 20
      }, 200);
      return false;
    }
    // 获取分数
    let score = checkedDetail.totalScore;
    switch (true) {
      case score <= 14:
        type = '保守型';
        break;
      case score > 14 && score <= 36:
        type = '稳健型';
        break;
      case score > 36:
        type = '积极应对型';
        break;
      default:
        type = '保守型';
    }

    me.sendData({
      score,
      riskType: type,
      skip: 0,
      scoreDetail: me.defaultScoreDetail(me.getQuestions().allQuestionsLen)
    });
  },
  bindEvent: function() {
    let me = this;
    $('.J_riskvail-question li').on('click', function() {
      self = $(this);
      self
        .prevAll('h5').removeClass('option-no-checked')
        .parent().data({
        'score': self.find('input')[0].value - 0,
        'checked': true,
      }).attr('checked', true);
    });
    $('.J_riskvail-skip-confirm').on('click', function(){
      me.closeModal();
      me.sendData({
        score: 0,
        skip: 1,
        riskType: '保守型',
        scoreDetail: me.defaultScoreDetail(me.getQuestions().allQuestionsLen)
      });

    });
    $('.J_riskvail-modal-wrap').on('click', function(event) {
      if ($(event.target)[0] == $(this)[0]) {
        me.closeModal();
      }
    });
    $('.J_riskvail-modal-btn-cancel').on('click', function() {
      me.closeModal();
    });
    $('.J_riskvail-modal-btn-retry').on('click', function(){
      me.closeModal();
      $('input:checked').prop('checked', false);
      $('.J_riskvail-question').attr('checked', false)
      $('html, body').animate({
        scrollTop: 0
      }, 200);
    });
    $('.J_riskvail-modal-btn-confirm').on('click', function() {
      me.closeModal();
      me.sendToApp();
    });
    $('.J_riskvail-btn-submit').on('click', function(){
      if ($(this).data('init')) {
        return false;
      }
      $(this).data('init', 1);
      me.calculate();
      $(this).data('init', 0);

    });
  },
  init: function() {
    let me = this;
    me.bindEvent();
    me.skipRiskvail();
  }
};

exports = module.exports = riskvail;