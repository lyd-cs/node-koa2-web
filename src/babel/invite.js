'user strict';

var ErrMsg = require('../../lib/errormsg');

var timer;
var invite = {
  nativeShowMessage: function() {
    app.interactive.showMessage({
      type: 'dialog',
      message: ErrMsg.inviteForbidMsg
    });
  },
  h5ShowMessage: function(message) {
    message = message || ErrMsg.inviteVersionJudge;
    var toastContainer = $('.J_invite-toast-notify');
    toastContainer.addClass('toast-show').text(message);
    if (timer){
      clearTimeout(timer);
    }
    timer = setTimeout(function() {
      toastContainer.removeClass('toast-show').addClass('toast-hide');
    }, 1500);
  },
  appInteractive: function(opt) {
    var me = this;
    $('.J_invite_btn').on('click', function() {
      if (opt.isLogin && opt.hasInviteActivityOverMsg) {
        me.h5ShowMessage(ErrMsg.inviteActivityOver);
        return;
      }
      if (opt.hasUpgradeMsg) {
        me.h5ShowMessage();
        return;
      }
      if (!opt.isLogin) {
        app.interactive.openAppPage({
          path: '/account/login'
        });
        return;
      }
      if (opt.hasNativeShowMsg) {
        me.nativeShowMessage();
        return;
      }
      if (!opt.isCreateEscrow) {
        app.interactive.openAppPage({
          path: '/user/escrowdialog_activity'
        });
        return;
      }
      app.interactive.share(opt.shareData);
    });
    $('.J_invite-record').on('click', function() {
      if (opt.hasUpgradeMsg) {
        me.h5ShowMessage();
        return;
      }
      if (opt.hasNativeShowMsg) {
        me.nativeShowMessage();
        return;
      }
      app.interactive.openAppPage({
        path: '/account/invite_friends_record_activity'
      });
    });
  },
  sellerInvite: function(opt) {
    var me = this;
    $('.J_invite-seller-share').on('click', function(){
      if (!opt.staffId) {
        me.h5ShowMessage(ErrMsg.isEmptyStaffId);
        return;
      }
      if (opt.hasUpgradeMsg) {
        me.h5ShowMessage();
        return;
      }
      app.interactive.share(opt.shareData);
    });
  },
  init: function(opt) {
    var me = this;
    opt.isCustomerDisplay && me.appInteractive(opt);
    opt.isSalesDisplay && me.sellerInvite(opt);
  }
};

exports = module.exports = invite;