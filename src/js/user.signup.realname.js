'use strict';
var util = require('./util');
var ErrMsg = util.ErrMsg;
var Form = util.Form;

var $el = {};
var option;
var defaultOption = {
  form: '#J_user-signup-realname-form'
};
var submitting = false;
var timer = null;
var duration = 5000;
var confirmForm = $('#J_user-signup-realname-form');
var confirmSubmit = $('.realname-confirm-btn');
var agreeParent = $('.realname-agree-wrapper');
var confirmAgree = $('#serviceAgree');

function bindValidate(form, options) {
  var opt;
  if (!form || !!form._bindValidate) {
    return form;
  }
  opt = $.extend({}, Form.validate, {
    errorPlacement: function(place, el) {
      var parent = $(el).parents('.form-group').addClass('error');
      var holder = $('.help-inline', parent);
      if (!holder.length) {
        holder = $('<div class="help-inline"></div>').appendTo(parent);
      }
      holder.empty().removeClass('success-msg info-msg')
        .addClass('error-msg').append(place);
    },
    success: function(msg, el) {
      var parent = $(el).parents('.form-group').removeClass('error');
      var holder = $('.help-inline', parent);
      if (!holder.length) {
        holder = $('<div class="help-inline"></div>').appendTo(parent);
      }
      holder.empty()
        .removeClass('error-msg info-msg');
      $('span', holder).remove();
    },
    rules: {
      username: {
        required: true,
        rangelength: [2, 20],
        isChinese: true
      },
      identityCard: {
        required: true,
        rangelength: [18, 18],
        isIdentityCard: true
      },
      password: {
        required: true,
        rangelength: [8, 20],
        isPwdIllegal: true,
        isPwdPure: true
      },
      confirmPassword: {
        required: true,
        rangelength: [8, 20],
        isPwdIllegal: true,
        equalTo: '#password'
      }
    },
    messages: {
      username: {
        required: ErrMsg.emptyRealname,
        rangelength: ErrMsg.isRealname,
        isChinese: ErrMsg.isRealname
      },
      identityCard: {
        required: ErrMsg.emptyIdentity,
        rangelength: ErrMsg.isIdentity
      },
      password: {
        required: ErrMsg.emptyPwd,
        rangelength: ErrMsg.lenPwd
      },
      confirmPassword: {
        required: ErrMsg.emptyRePwd,
        rangelength: ErrMsg.lenPwd,
        equalTo: ErrMsg.rePwd
      }
    }
  });
  if (options) {
    $.extend(true, opt, options);
  }
  $(form).validate(opt);
  form._bindValidate = true;
}

var userSignupRealname = {
  checkAgree: function() {
    agreeParent.on('click', function() {
      if (confirmAgree.prop('checked')) {
        confirmSubmit.attr('disabled', false);
      } else {
        confirmSubmit.attr('disabled', true);
      }
    });
  },
  submitHandle: function() {
    confirmForm.on('submit', function(event) {
      if (submitting || timer) {
        event.preventDefault();
        clearInterval(timer);
        timer = null;
        return false;
      }
      submitting = true;
      timer = setTimeout(function() {
        submitting = false;
      }, duration);
    });
  },
  init: function(opt) {
    var me = this;
    if (!!me._init) {
      return me;
    }
    option = $.extend({}, defaultOption, opt);
    $.each(['form'], function(k, v) {
      $el[v] = $(option[v]);
    });
    me.checkAgree();
    me.submitHandle();
    bindValidate($el.form);
    me._init = true;
    return me;
  }
};

exports = module.exports = userSignupRealname;
