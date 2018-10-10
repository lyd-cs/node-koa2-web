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
      $(window).scrollTop(200);
      me.loanPost({
        page: _page,
        filter: _filter
      });
      return false;
    });
  },
  loanPost: function(opt){
    if(opt){
      if(!opt['page']){
        data.page = 1;
      }
      $.extend(data, opt);
    }
    $('#J_loan-list-wrap').html(_tpl_loading);
    $.post('/api/account/loan/list', data, 'json')
      .done(function(json){
        var ret = json.data;
        if(json.status !== 0){
          $('#J_loan-list-wrap').html('<div class="no-result">服务器错误，请稍后重试！</div>');
        }
        $('#J_loan-list-wrap').html(ret.html);
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
