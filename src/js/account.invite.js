'use strict';

var option;
var tpl_loading = require('./tpl/loading.pug');

var defaultOption = {
  apiUrl: '/api/account/invite',
  targetContainer: '.J_invite-list-body'
};

var ajaxPageList = {
  sendPageAjax: function(apiUrl, targetContainer, data) {
    var listContainer = $(targetContainer);
    listContainer.html(tpl_loading);
    $.get(apiUrl, data)
      .done(function(val) {
        if (!val || val.status !== 0) {
          listContainer.html(tpl_loading);
          return;
        }
        listContainer.html(val.data.html);
      });
  },
  getListCont: function() {
    var me = this;
    var targetContainer = option.targetContainer;
    $(targetContainer).on('click', '.page-btn', function() {
      var item = $(this);
      var _apiUrl = option.apiUrl;
      var curPage = item.data('page');
      var paginationData = $('.pagination').data('page');
      var _page = {
        page: curPage
      };
      if (paginationData == curPage || !_apiUrl) return false;
      $(window).scrollTop($('#J_invite-list').offset().top);
      me.sendPageAjax(_apiUrl, targetContainer, _page);
    });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    me.getListCont();
    me._init = true;
    return me;
  }
};

exports = module.exports = ajaxPageList;
