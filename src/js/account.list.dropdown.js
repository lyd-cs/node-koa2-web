'use strict';

var _tpl_dropdown_list = require('./tpl/account.dropdown.list.pug');
var accountListDropdown = {
  dropdownMenu: function() {
    var me = this;
    $('#J_loan-list-wrap').on('click', '.J_dropdown', function(e){
      e.preventDefault();
      var _apiUrl,_data;
      var target = $(e.target);
      var colNum = target.parent().siblings().length+1;
      var loanId = target.data('loanid') - 0 || 0;
      var financePlanSubpointId = target.data('subpointid') - 0 || 0;
      var filter = target.data('filter') - 0 || 0;
      var derail = target.data('derail') - 0 || 0;
      _apiUrl = filter ? '/api/loan/list/dropdown': '/api/plan/list/dropdown';
      _data = {
        loanId: loanId,
        filter: filter,
        financePlanSubpointId: financePlanSubpointId
      };
      if(!derail){
        target.parents('.J_uc-tab-item').siblings().removeClass('add-border').siblings('.J_dropdown-menu').find('.J_dropdown-box').slideUp('slow', function(){
          $(this).parent().hide();
        });
        $('.J_dropdown').data('derail', 0).removeClass('collect');
        target.data('derail', 1).addClass('collect');
        me.sendApi(_apiUrl, _data, colNum, target);
      }else{
        target.removeClass('collect');
        target.data('derail', 0).parents('.J_uc-tab-item').removeClass('add-border').next().find('.J_dropdown-box').slideUp('slow', function(){
          $(this).parent().hide();
        });
      }
    });
  },
  sendApi: function(apiUrl, data, colNum, target){
    var $dropdownList;
    var prime = target.data('prime') - 0 || 0;
    if(prime){
      target.parents('.J_uc-tab-item').next().find('.J_dropdown-box').parent().show().find('.J_dropdown-box').slideDown('slow', function(){
        target.parents('.J_uc-tab-item').addClass('add-border');
      });
    }else{
      $dropdownList = target.parents('.J_uc-tab-item').after(_tpl_dropdown_list({
        combineColNum: colNum
      }));
      $.post(apiUrl, data).done(function(data){
        $dropdownList.next().find('.J_dropdown-box').html(data.data.html).slideDown('slow', function(){
          target.parents('.J_uc-tab-item').addClass('add-border');
        });
        target.data('prime', '1');
      });
    }
  },
  init: function() {
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.dropdownMenu();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountListDropdown;