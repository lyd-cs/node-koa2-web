/**
 * page ajax
 */

var _tpl_loading = require('./tpl/loading.pug');

var $el = {};
var defaultOption = {
  loanHolder: '#J_loan-wrap',
  pageHolder: '.J_pager'
};
var option;

var data = {
  page: 1
};

var pageAjax = {
  bindPageEvent: function(){
    var me = this;
    $('#J_loan-wrap').on('click', '.page-btn', function(e){
      e.preventDefault();
      var that = $(this);
      var _page = that.data('page') - 0;
      var _filter = that.data('filter') - 0;
      me.planPost({
        page: _page,
        filter: _filter
      });
      var traderOffsetTop = $el.loanHolder.offset().top;
      $(window).scrollTop(traderOffsetTop - 130);
      return false;
    });
  },
  planPost: function(opt){
    if(opt){
      if(!opt['page']){
        data.page = 1;
      }
      $.extend(data, opt);
    }
    $('#J_plan-list-wrap').html(_tpl_loading);
    $.post('/api/account/plan/list', data, 'json')
      .done(function(json){
        var ret = json.data;
        if(json.status !== 0){
          $('#J_plan-list-wrap').html('<div class="no-result">服务器错误，请稍后重试！</div>');
        }
        $('#J_plan-list-wrap').html(ret.html);
      });
  },
  init: function(opt){
    var me = this;
    if (!!me._init) {
      return me;
    }
    me._init = true;
    option = $.extend({}, defaultOption, opt);
    $.each(['pageHolder', 'loanHolder'], function(k, v){
      $el[v] = $(option[v]);
    });
    me.bindPageEvent();
    return me;
  }
};

exports = module.exports = pageAjax;
