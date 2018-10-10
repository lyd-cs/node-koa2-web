/**
 * h5 about product intro
 */
'use strict';

var popModal = {
  bindEvent: function(opt){
    let me = this;
    let showSwitchId = opt.showSwitchId;
    let hideSwitchId = opt.hideSwitchId;
    let modalId = opt.modalId;

    $(showSwitchId).on('click', function() {
      me.openModal(modalId);
    });
    $(hideSwitchId).on('click', function(event) {
      if($(event.target)[0] == $(this)[0]){
        me.closeModal(modalId);
      }
    });
  },
  openModal: function(modalId){
    $(modalId).addClass('modal-in').on('touchmove', function(e){
      e.preventDefault();
    });
  },
  closeModal: function(modalId){
    $(modalId).removeClass('modal-in');
  },
  init: function(opt){
    let me = this;
    me.bindEvent(opt);
  }
};

exports = module.exports = popModal;