'use strict';

var _tpl_plan_exit_cancle_fail = require('./tpl/plan.exit.cancle.fail.pug');
var _tpl_plan_exit_fail = require('./tpl/plan.exit.fail.pug');
var _tpl_modal = require('./tpl/modal.plan.exit.pug');
var moment = require('moment');
var $planDetail = $('#J_plan-exit');
var $modalParent = $('#J_plan-exit-modal');
var accountPlanDetail = {
  modalShow: function(opt){
    var planId = opt.planId;
    var calmPeriodTime = opt.calmPeriodTime;
    $('#J_plan-exit-can').click(function(){
      $.post('/api/plan/exit/confirm', {id: planId}).done(function(json){
        if(json.status !== 0){
          $planDetail.html(_tpl_plan_exit_fail).addClass('uc-setting');
          return;
        }
        var quitTime = json.data.endLockingTime - 0;
        $modalParent.html(_tpl_modal({status: 'exit', planId: planId })).modal('show');
        $('#J_quit-date').html(moment(quitTime).format('YYYY-MM-DD'));
      }).fail(function(){
        $planDetail.html(_tpl_plan_exit_fail).addClass('uc-setting');
        return;
      });
    });
    $planDetail.on('click', '#J_again-exit',function(){
      location.reload();
    });
    $('#J_plan-exit-cancle').click(function(){
      $modalParent.html(_tpl_modal({status: 'cancle'})).modal('show');
    });
    $('#J_plan-join-cancle').click(function(){
      $modalParent.html(_tpl_modal({status: 'joinCancle', planId: planId, calmPeriodTime: calmPeriodTime})).modal('show');
    });
  },
  sendCancle: function(planId){
    $.post('/api/plan/exit/cancle', {id: planId}).done(function(json){
      if(json.status !== 0){
        $modalParent.html(_tpl_modal({status: 'cancle'})).modal('hide');
        $planDetail.html(_tpl_plan_exit_cancle_fail).addClass('uc-setting');
        return;
      }
      $modalParent.html(_tpl_modal({status: 'cancle'})).modal('hide');
      location.reload();
    });
  },
  clickPlanCancle: function(planId){
    var me = this;
    $modalParent.on('click', '#J_plan-exit-cancle-btn', function(){
      me.sendCancle(planId);
    });
    $planDetail.on('click', '#J_plan-cancle-again', function(){
      me.sendCancle(planId);
    });
  },
  init: function(opt){
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.modalShow(opt);
    me.clickPlanCancle(opt.planId);
    me._init = true;
    return me;
  }
};

exports = module.exports = accountPlanDetail;

