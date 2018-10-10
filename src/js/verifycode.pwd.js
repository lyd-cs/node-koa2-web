/**
 * verifycode
 */
var isSubmiting = false;
var $el = {};
var defaultOption = {
  form: '#J_mobile-form',
  action: 'oldmobile'
};
var option;

var _timer;
var _count = 0;
var defCount = 60;

function disableVerify(){
  var _title = _count > 0 ? ['再次获取(', _count , ')'].join('') : '再次获取';
  $el.trigger.prop('disabled', true).text(_title);
  isSubmiting = true;
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
function showError(msg){
  $el.validator.showErrors({
    smscode: msg
  });
}
function send(data){
  $.post('/api/send/smscode', data)
    .done(function(json){
      showError('');
      if(json.status !== 0){
        showError(json.message);
        return;
      }
      startCountDown();
      if (option.action === 'planquit' || option.action === 'calmperiod') {
        $('.smscode-sure').show();
      }
    }).fail(function(){
      enbaleVerify();
    });
};
function bindEvent(){
  var trigger = $el.trigger;
  trigger.data('origin', trigger.text());
  trigger.on('click', function(){
    var _data = {
      mobile: option.mobile,
      action: option.action
    };
    if ( isSubmiting ) {
      return;
    }
    if ( $el.input && $el.input.length ) {
      //data.mobile = $el.input.val();
      if ( $el.input.valid && !$el.validator.element($el.input) ) {
        $($el.input).focus();
        return;
      }
    }
    send(_data);
  });
};

var verifycode = {
  init: function(opt){
    var me = this;
    option = $.extend({}, defaultOption, opt);
    $.each(['input', 'trigger', 'form', 'smscode'], function(k, v){
      $el[v] = $(option[v]);
    });
    if ( option.idIdentity && $el.input && $el.input.length ) {
      $el.form = $(option.form);
      $el.validator = $el.form.validate();
    }
    if($el.smscode && $el.smscode.length){
      $el.form = $(option.form);
      $el.validator = $el.form.validate();
    }
    bindEvent();
    return me;
  }
};

exports = module.exports = function(opt){
  return verifycode.init(opt);
};
