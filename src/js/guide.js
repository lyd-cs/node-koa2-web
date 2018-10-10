'use strict';

var option;
var defaultOption = {
  apiUrl: '/api/guide',
  clickBtn: '.btn-profit'
};
var oldIptVal = 0;
var arrWidth = ['80px', '160px', '300px', '470px'];
var arrDurationMonth = [3, 6, 12, 24];
var processBar = $('.guide-plan-profit-processing');
var processBarText = $('.guide-plan-profit-processing-text');
var inputEle = $('.money-input');
var rates = [];

var guideProfit = {
  progressHandler: function(rates) {
    var ipt = inputEle.val() - 0;
    // var _profit = ipt*rate/100/12;
    processBar
      .width(0)
      .each(function(index) {
        $(this).animate({width:arrWidth[index]},{complete:function() {
          processBarText.eq(index).text((ipt*rates[index]/100/12*arrDurationMonth[index]).toFixed(2)+'元');
        }});
      });
  },
  getRate: function(apiUrl) {
    var me = this;
    $.post(apiUrl)
      .done(function(json) {
        if (!json || json.status !== 0){
          return;
        }
        //success
        var planRates = json.data.expectedRateByMonth;
        for (var index in planRates) {
          rates.push(planRates[index].expectedRate || 0);
        }

        if (!planRates) return false;
        me.progressHandler(rates);
      });
  },
  validateHandler: function() {
    var me = this;
    var _apiUrl = option.apiUrl;
    var curIptVal = inputEle.val();
    //condition judge
    if (!Number(curIptVal)) return false;
    if (isNaN(curIptVal)) {
      oldIptVal = curIptVal;
      return false;
    }
    if (curIptVal === oldIptVal) return false;
    oldIptVal = curIptVal;
    me.getRate(_apiUrl);
  },
  triggerCalculateHandler: function() {
    var me = this;
    var clickBtn = option.clickBtn;
    $(clickBtn).on('click', function() {
      var curIptVal = inputEle.val();
      if (isNaN(curIptVal) || !curIptVal){
        return false;
      }
      me.progressHandler(rates);
    });
    // inputEle.on('keyup', function (event) {
    //   var inputVal= $(this).val().replace(/^0+(\d+)/,function ($0,$1) {
    //     return $1;
    //   });
    //   $(this).val(inputVal);
    //   //enter action
    //   if(event.which !== 13) return false;
    //   me.validateHandler();
    // });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    me.triggerCalculateHandler();
    me.validateHandler();
    me._init = true;
    return me;
  }
};

exports = module.exports = guideProfit;