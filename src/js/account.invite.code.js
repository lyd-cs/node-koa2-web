'user strict';

var util = require('./util');
var ErrMsg = util.ErrMsg;

exports = module.exports =  settingInviteCode = {
  inviteCodeValid: function(){
    $('.J_btn-secure-submit').on('click', function(){
      var inviteCode = $('input[name=code]').val();
      if (!inviteCode) {
        $('.help-inline').html('');
        $('.help-inline').html(ErrMsg.isEmptyInviteCode);
        return false;
      }
      $('.help-inline').html('');
    });
  }
};