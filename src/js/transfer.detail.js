'use strict';
var util = require('./util');
var ErrMsg = util.ErrMsg;
var modal_tpl = require('./tpl/modal.riskvail.pug');
var nothing_tpl = require('./tpl/nothing.data.pug');
var _tpl_loading = require('./tpl/loading.pug');

var $el = {};
var option;
var defaultOption = {
  form: '#J_buy-form'
};

function addError(m) {
  $('.product-buy-validate')
    .html('')
    .append('<span class="error-warn">' + m + '</span>');
}

var dict = {
  '#user_order': '/api/loan/investRecord',
  '#user_refund': '/api/loan/refundPlan',
  '#user_debt': '/api/loan/debt',
  '#user_transfer': '/api/loan/transfer'
};

var profitFlag = 0;

var loanDetail = {
  clickTab: function() {
    var me = this;
    var $tab = $('#J_loan-item-nav').find('.J_tab-pane');
    $tab.click(function() {
      var target = $(this).data('target');
      if (!(target in dict)) {
        return;
      }
      if ($(this).data('init') == 1) {
        return;
      }
      me.send(dict[target], target);
      $(this).data('init', 1);
    });
  },
  send: function(apiUrl, target) {
    var _data;
    if (target === '#user_debt' || target === '#user_transfer') {
      _data = {
        transferId: option.transferId
      };
    } else {
      _data = {
        loanId: option.loanId
      };
    }
    $(target).html(_tpl_loading);
    $.post(apiUrl, _data).done(function(data) {
      if (!data.data.html) {
        $(target).html(nothing_tpl());
        return;
      }
      $(target).html(data.data.html);
    });
  },
  keyupValidate: function(e) {
    var lastCash = option.restInvest - 0;
    var isLogin = option.isLogin;
    var investLimit = option.investLimit;
    var iptVal = $('#J_ipt').val() - 0;
    var resetVal = lastCash - iptVal;
    if (iptVal == '') {
      profitFlag = 0;
      if (e.which !== 13) {
        $('.product-buy-validate').html('');
      }
      return false;
    }
    if (iptVal != lastCash && lastCash <= investLimit) {
      profitFlag = 0;
      addError('您当前出借金额须为' + lastCash + '元');
      return false;
    }
    if (isNaN(iptVal)) {
      profitFlag = 0;
      addError(ErrMsg.isNumber);
      return false;
    }
    if (iptVal < investLimit) {
      profitFlag = 0;
      addError(investLimit + '元起投，' + investLimit + '元递增');
      return false;
    }
    if (iptVal !== lastCash && (iptVal % investLimit) !== 0 && lastCash > investLimit) {
      profitFlag = 0;
      addError(investLimit + '元起投，' + investLimit + '元递增');
      return false;
    }
    if (isLogin && iptVal > lastCash) {
      profitFlag = 0;
      addError('本期可加入上限' + lastCash + '元');
      return false;
    }
    if (resetVal > 0 && resetVal < 100) {
      profitFlag = 0;
      addError('最后所剩剩余金额不可小于100元');
      return false;
    }
    profitFlag = 1;
    $('.product-buy-validate').html('');
  },
  guardHandle: function() {
    var data = {
      score: 0
    };
    $.post('/api/riskGuard', data)
      .done(function(data) {
        if (data.status != 0) {
          $('#J_guard-err').html(data.message);
          return;
        }
        $('.modal').modal('hide');
        location.reload();
      });
  },
  submitValidate: function(e) {
    var me = this;
    var isLogin = option.isLogin;
    var isRisk = option.isRisk;
    var $modal;
    var modalShow = function(modalId) {
      $modal = $(modal_tpl({
        modalBoxId: modalId
      }));
      $modal.appendTo('#J_user-secure').modal('show');
      $('#J_guard').on('click', function(e) {
        e.preventDefault();
        me.guardHandle();
      });
      $('#J_cancle').on('click', function() {
        $('.modal').modal('hide');
      });
    };
    var iptVal = $('#J_ipt').val();
    if (isLogin) {
      if (!isRisk) {
        var modalId = 1;
        modalShow(modalId);
        e.preventDefault();
        return false;
      }
      if (iptVal == '') {
        profitFlag = 0;
        $('.product-buy-validate').html('');
        addError(ErrMsg.isAmount);
        e.preventDefault();
        return false;
      }
      // if (/[A-Za-z]+/.test(iptVal)) {
      //   profitFlag = 0;
      //   addError('出借金额不能包含字母');
      //   e.preventDefault();
      //   return false;
      // }
      if (!profitFlag) {
        e.preventDefault();
        return false;
      }
    }
    $('.product-buy-validate').html('');
  },
  inputMoneyPattern: function() {
    var _ipt = $('#J_ipt');
    var _val = _ipt.val();
    var value = _val.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
    _ipt.val(value);
    // if (/[A-Za-z]+|(^0+)/.test(_val)) {
    //   var newVal = _val.replace(/[A-Za-z]+|(^0+)/g, '');
    //   _ipt.val(newVal);
    // }
  },
  formValidate: function() {
    var me = this;
    var lastCash = option.restInvest - 0;
    if (lastCash < 200) {
      $('#J_ipt').prop('disabled', 'disabled');
      profitFlag = 1;
      $('#J_ipt').val(lastCash);
    }
    $('#J_ipt').on('keyup', function(e) {
      me.inputMoneyPattern();
      me.keyupValidate(e);
    });
    $('#J_buy-form').on('submit', function(e) {
      if (e.result !== false) {
        me.submitValidate(e);
      }
    });
  },
  buyAllHandler: function() {
    var me = this;
    $('.product-invest-buy').on('click', function() {
      $('#J_ipt').val(option.restInvest).focus();
      me.keyupValidate();
    });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.clickTab();
    me.formValidate();
    me.buyAllHandler();
    me._init = true;
    return me;
  }
};

exports = module.exports = loanDetail;