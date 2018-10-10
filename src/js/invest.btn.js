'user strict';

var $el={};
var option;
var defaultOption = {
  form: '#J_buy-form'
};
var modal_tpl_createaccount = require('./tpl/user.create.account.guide.pug');
var modal_tpl_info = require('./tpl/user.info.perfect.pug');
var $modal;

function createAccountGuideModal() {
  if ($modal) {
    $modal.modal('show');
    return;
  }
  $modal = $(modal_tpl_createaccount());
  $modal.appendTo($(document.body)).modal();
}
function infoModalShow(type) {
  if ($modal) {
    $modal.modal('show');
    return;
  }
  $modal = $(modal_tpl_info(type));
  $modal.appendTo($(document.body)).modal();
  $modal.on('click', '.do-nothing', function(){
    $modal.modal('hide');
  });
}
function investBtnTypeJudge(opt) {
  var type;
  if (!opt.isIdPassed) {
    type = 'idNo';
  } else if (!opt.isSettingTradPwd) {
    type = 'tradPwd';
  } else if (!opt.isMobilePassed) {
    type = 'mobile';
  }
  return type;
}
function chargeBtnTypeJudge(opt) {
  var type;
  if (!opt.isIdPassed) {
    type = 'idNo';
  } else if (!opt.isSettingTradPwd) {
    type = 'tradPwd';
  } else if (!opt.isBindCard) {
    type = 'bankCard';
  } else if (!opt.isMobilePassed) {
    type = 'mobile';
  }
  return type;
}
// function riskBtnTypeJudge(opt) {
//   var type;
//   if (!opt.isIdPassed) {
//     type = 'idNo';
//   }
//   return type;
// }
function bindEvent(opt) {
  var isLogin = opt.isLogin;
  $('#J_buy-form').on('submit', function(){
    var type = investBtnTypeJudge(opt);
    if(isLogin){
      if (!opt.isCreateAccount) {
        createAccountGuideModal();
        return false;
      } else if (type) {
        infoModalShow({
          type: type
        });
        return false;
      }
    }
  });
  $('.J_charge-createaccount-guide').on('click', function(){
    var type = chargeBtnTypeJudge(opt);
    if (!opt.isCreateAccount) {
      createAccountGuideModal();
      return false;
    } else if (type) {
      infoModalShow({
        type: type
      });
      return false;
    }
  });
  $('.J_riskvail-createaccount-guide').on('click', function(){
    if (!opt.isCreateAccount) {
      createAccountGuideModal();
      return false;
    } else if (!opt.isIdPassed) {
      infoModalShow({
        type: 'idNo'
      });
    }
  });
  $('.J_tradpwd-createaccount-guide').on('click', function(){
    if (!opt.isCreateAccount) {
      createAccountGuideModal();
      return false;
    }
    else if (!opt.isIdPassed) {
      infoModalShow({
        type: 'idNo'
      });
    } else if (!opt.isMobilePassed) {
      infoModalShow({
        type: 'mobile'
      });
    }
  });
}
exports = module.exports = modalShow = {
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v){
      $el[v] = $(option[v]);
    });
    bindEvent(opt);
    me._init = true;
    return me;
  }
};