/**
 * verifycode
 */
var isSubmiting = false;
var $el = {};
var defaultOption = {
  action: 'forgot',
};
var option;

var _timer;
var _count = 0;
var defCount = 60;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $el.trigger.prop('disabled', true).text(_title);
  isSubmiting = true;
  $el.voiceVerifycode.attr('disabled', true).parent().addClass('voice-gray');
};
function enbaleVerify(){
  _count = 0;
  clearTimeout(_timer);
  $el.trigger.prop('disabled', false).text($el.trigger.data('origin'));
  isSubmiting = false;
};
function countDown(){
  disableVerify();
  if ( _count <=0 ) {
    enbaleVerify();
    $el.voiceVerifycode.attr('disabled', false).parent().show().removeClass('voice-gray');
    $('.J_smscode-group').css('margin-bottom', '35px');
  }
  _count--;
};
function startCountDown(){
  _count = defCount;
  countDown();
  _timer = setInterval(function(){
    countDown();
  }, 1000);
};
function showError(msg, key){
  var err = {};
  key = key || 'smscode';
  err[key] = msg;
  $el.validator.showErrors(err);
  // $el.input.focus();
}
// function showNewSmscodeError(msg){
//   $el.validator.showErrors({
//     newsmscode: msg
//   });
//   // $el.input.focus();
// }
function send(data){
  var _action = option.action;
  $.post('/api/verifycode/send', data)
    .done(function(json){
      isSubmiting = false;
      var key;
      var message;
      if(json.status !== 0){
        key = 'mobile';
        message = json.message;
        if (json.data && json.data.captcha) {
          key = 'captcha';
          message = json.data[key];
        }
        if(_action == 'newmobile'){
          key = 'newsmscode';
        }
        showError(message, key);
        return false;
      }
      $el.captchaimg.trigger('click');
      startCountDown();
    }).fail(function(err){
      isSubmiting = false;
      if(_action == 'newmobile'){
        showError(err.responseJSON.message, 'newsmscode');
      }else{
        showError(err.responseJSON.message);
      }
      enbaleVerify();
    });
};
function handlerVerifycode(value){
  var data = {
    action: value.action,
    noCaptcha: value.noCaptcha
  };
  if ( isSubmiting ) {
    return;
  }
  if ( $el.input && $el.input.length ) {
    data.mobile = $el.input.val();
    if ( data.action !== 'inviteRegister' && $el.input.valid && !$el.validator.element($el.input) ) {
      $el.input.focus();
      return;
    }
  }
  if( $el.captchaholder && $el.captchaholder.hasClass('hide')){
    $el.captchaholder.removeClass('hide');
    return;
  }
  if ( $el.captcha && $el.captcha.length ) {
    data.captcha = $el.captcha.val();
    if ( $el.captcha.valid && !$el.validator.element($el.captcha) ) {
      $el.captcha.focus();
      return;
    }
  }
  if($('#J_smscode-error') && $('#J_smscode-error').html()){
    $('#J_smscode-error').html('').prevAll().hide();
  }
  isSubmiting = true;
  send(data);
};

function bindEvent(){
  var trigger = $el.trigger;
  trigger.data('origin', trigger.text());
  trigger.on('click', function(){
    handlerVerifycode(option);
    return;
  });
  $el.voiceVerifycode.on('click', function(){
    handlerVerifycode({action: 'signupVoice'});
    return;
  });
  $el.captchaimg.on('click', function(){
    var $target = $($(this).data('target'));
    var src = $target.data('src');
    $target.attr('src', (src + '?' + Math.random()));
    return false;
  });
}

var verifycode = {
  init: function(opt){
    var me = this;
    option = $.extend({}, defaultOption, opt);
    $.each(['input', 'trigger', 'captcha', 'captchaimg', 'captchaholder', 'voiceVerifycode'], function(k, v){
      $el[v] = $(option[v]);
    });
    if ( $el.input && $el.input.length ) {
      $el.form = $($el.input.get(0).form);
      $el.validator = $el.form.validate();
    }
    if ( $el.captcha && $el.captcha.length ) {
      $el.form = $($el.captcha.get(0).form);
      $el.validator = $el.form.validate();
    }

    bindEvent();
    return me;
  }
};

exports = module.exports = function(opt){
  return verifycode.init(opt);
};