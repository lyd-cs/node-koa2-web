'use strict';

var accountMessage = {
  slider: function() {
    $('#J_message-list').on('click', '.J_message-title', function() {
      $(this).siblings('.J_message-content').toggle();
    });
  },
  forbidReadBtn: function() {
    var $ucReadedBtn = $('#J_account-message').find('.J_uc-readed-btn');
    var $messageItemChecked = $('.list-item').find('input:checked');
    if ($messageItemChecked.length === 0) {
      $ucReadedBtn.prop('disabled', true);
      $ucReadedBtn.addClass('uc-readed-btn-disabled');
    } else {
      $ucReadedBtn.prop('disabled', false);
      $ucReadedBtn.removeClass('uc-readed-btn-disabled');
    }
  },
  selected: function() {
    var me = this;
    var $selectedAll = $('.J_selected-all');
    var $messageItem = $('.J_item-checkbox:enabled');
    $selectedAll.on('click', function() {
      if ($(this).prop('checked')) {
        $messageItem = $('.J_item-checkbox:enabled');
        $messageItem.prop('checked', true);
        $messageItem.parents('.icon-simulate-checkbox').toggleClass('icon-simulate-checkbox-checked');
      } else {
        $messageItem.prop('checked', false);
        $messageItem.parents('.icon-simulate-checkbox').toggleClass('icon-simulate-checkbox-checked');
      }
      me.forbidReadBtn();
    });
    $messageItem.on('click', function() {
      if ($messageItem.not(':checked').length) {
        $selectedAll.prop('checked', false);
        $selectedAll.parents('.icon-simulate-checkbox').removeClass('icon-simulate-checkbox-checked');
      } else {
        $selectedAll.prop('checked', true);
        $selectedAll.parents('.icon-simulate-checkbox').addClass('icon-simulate-checkbox-checked');
      }
      me.forbidReadBtn();
    });
  },
  bindClick: function() {
    var me = this;
    $('#J_message-list').on('click', '.J_message-title', function() {
      var _id = $(this).data('msgid');
      if ($(this).data('init') == 1) {
        return;
      }
      me.send({
        id: _id,
        el: $(this).parents('.uc-message-content')
      });
    });
    $('.J_uc-readed-btn').on('click', function(){
      var msgidString;
      $('.J_item-checkbox:checked').each(function(i) {
        if (i == 0) {
          msgidString = $(this).parents('.icon-simulate-checkbox').siblings('.uc-message-content').find('.J_message-title').data('msgid');
        } else {
          msgidString = msgidString + ',' + $(this).parents('.icon-simulate-checkbox').siblings('.uc-message-content').find('.J_message-title').data('msgid');
        }
      });
      me.send({
        id: msgidString,
        el: $(this).siblings('#J_message-list').find('.J_item-checkbox:checked'),
        shouldReload: 1
      });
    });
  },
  send: function(opt) {
    var data = {
      msgid: opt.id
    };
    var _holder = opt.el;
    console.log(data);
    $.post('/api/account/message/read', data)
      .done (function(value){
        if(value.status !== 0){
          return;
        }
        _holder.parents('.list-item').removeClass('unread');
        _holder.data('init', 1);
        _holder.siblings('.icon-simulate-checkbox').find('input').attr('disabled', 'disabled');
        _holder.siblings('.icon-simulate-checkbox').addClass('icon-simulate-checkbox-disabled');
        if(opt.shouldReload){
          window.location.reload(true);
        }
      }).fail(function(){
        return;
      });
  },
  cheboxAction: function(){
    $('.icon-simulate-checkbox-uncheck').on('click', function(e){
      if($(e.target).is('input')){
		    return;
	    }
      $(this).toggleClass('icon-simulate-checkbox-checked');
    });
  },
  init: function() {
    var me = this;
    if (!!me._init) {
      return me;
    }
    me.cheboxAction();
    me.forbidReadBtn();
    me.slider();
    me.selected();
    me.bindClick();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountMessage;