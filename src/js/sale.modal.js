'user strict';

var modal_tpl_invite = require('./tpl/sale.invite.pug');
var $modal;

function inviteModalShow() {
  if ($modal) {
    $modal.modal('show');
    return;
  }
  $modal = $(modal_tpl_invite());
  $modal.appendTo($(document.body)).modal();
}

function bindEvent() {
  $('#J_sale-invite').on('click', inviteModalShow);
}
exports = module.exports = modalShow = {
  init: function(){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    bindEvent();
    me._init = true;
    return me;
  }
};