var landingSignupStep = require('./landing.signup.step');
var { trackEvent } = require('./statistics');
var $turntable = $('.turntable-prize');
var $registerForm = $('#J_form-control-register');
var $turntableShade = $('.J_turntable-shade');
var $exchangeDialog = $('.J_exchange-dialog');
var $degree = $('.J_degree');
var count = 2,
    isture = 0;

$degree.html(count);

function baiduTrackEvent(action) {
  var utmSource = $('input[name="utmSource"]').val();
  trackEvent(utmSource, action);
}

function startLottery() {
  if (isture) return;
  isture = true;
  if (count <= 0) {
    isture = false;
    showDialog('showLotteryResultGoPoint');
  } else {
    baiduTrackEvent('clickGo');
    turntableTimesCount();
    selectPrizes();
  }
  $degree.html(count);
  $('.J_go-point').css({
    'animation-play-state': 'paused',
    'transform': 'translateX(0px)'
  });
}

function turntableTimesCount() {
  count = count - 1;
  if (count <= 0) {
    count = 0;
  }
}

function gotoTopTurntable(topVal) {
  $('html, body').animate({ scrollTop: topVal }, 500);
}

function selectPrizes() {
  var data = [4, 6];
  switch (data[count]) {
    case 1:
      rotate(245);
      break;
    case 2:
      rotate(203);
      break;
    case 3:
      rotate(160);
      break;
    case 4:
      rotate(115);
      break;
    case 5:
      rotate(70);
      break;
    case 6:
      rotate(25);
      break;
    case 7:
      rotate(290);
      break;
    case 8:
      rotate(340);
      break;
  }
}

function rotate(angle) {
  isture = true;
  $turntable.stopRotate();
  $turntable.rotate({
    angle: 0,
    duration: 2000,
    animateTo: angle + 1440,
    callback: function() {
      isture = false;
      showDialog('showLotteryResultGoPoint');
    }
  });
}

function showLotteryResult() {
  if (count === 1) {
    baiduTrackEvent('600Popup1'); //弹框1-(600)
    $turntableShade.removeClass('hide');
    $exchangeDialog
      .removeClass('prizes-six register-six register-eight hide')
      .addClass('prizes-eight');
  }
  if (count === 0) {
    baiduTrackEvent('600+850Popup1');//弹框1-(600+850)
    $turntableShade.removeClass('hide');
    $exchangeDialog
      .removeClass('prizes-eight register-six register-eight hide')
      .addClass('prizes-six');
    $('.exchange-times').removeClass('hide').siblings('.exchange-draw')
    .addClass('hide');
  }
}

function closeDialog() {
  $('.J_turntable-shade, .J_exchange-dialog').addClass('hide');
}

function showDialog(step) {
  gotoTopTurntable('0px');
  if(step === 'showLotteryResultHomePage'){
    baiduTrackEvent('clickExchange');//点击首页立即兑奖按钮
    showLotteryResult();
  }
  if(step === 'showLotteryResultGoPoint'){
    if (count === 1) {
       $('.J_prize-show-eight')
        .removeClass('hide').siblings('.J_prize-show-none')
        .addClass('hide');
      showLotteryResult();
    }
    if (count === 0) {
      $('.J_prize-show-eight')
        .addClass('hide').siblings('.J_prize-show-six')
        .removeClass('hide');
      showLotteryResult();
    }
  }
  if(step === 'showLotteryResultMobile'){
    $('#J_form-control-mobile, #J_turntable-draw').removeClass('hide');
    $registerForm.addClass('hide');
    $('#J_btn-invite-submit').html('立即兑换');
    showLotteryResult();
  }
}
function goDraw(btnType) {
  if(btnType === 'draw'){
    baiduTrackEvent('thanksPopup1button1');//谢谢弹框1-(600)button1
  }
  if(btnType === 'times'){
    baiduTrackEvent('thanksPopup1button2');//谢谢弹框1-(600)button2
  }
  if(count === 1){
    baiduTrackEvent('600Popup1button2');//弹框1按钮2-(600)
  }
  if (count === 0) {
    baiduTrackEvent('600+850Popup1button2');//弹框1按钮2-(600+850)
  }
}

var landingMiyaTurntable = {
  tiggerTurntableEvent: function() {
    $('#J_turntable-draw').on('click', '.exchange-draw', function() {
      closeDialog();
      goDraw('draw');
    }); //点击继续抽奖按钮
    $('#J_turntable-draw').on('click', '.exchange-times', function() {
      goDraw('times');
    }); //点击次数用光按钮
    $('.J_turntable-point-zhizhen').on('click', startLottery); //点击go按钮
    $('#J_register-form-close').on('click', closeDialog); //点击弹框关闭按钮
    $('.J_form-edit').on('click', function() {
      showDialog('showLotteryResultMobile');
    }); //点击短验页面修改按钮
    $('#J_turntable-exchange-index').on('click', function() {
      gotoTopTurntable('0px');
      showDialog('showLotteryResultHomePage');
    });// 点击首页立即兑奖
  },
  noticeScroll: function() {
    var $noticeBox = $('#J_notice-box');
    var liHeight = 35;
    var scrollSpace = 3000;
    var scrollSpeed = 2000;
    function noticeScrollUp(obj) {
      var $noticeContext = obj.find('ul:first');
      $noticeContext.animate(
        { 'margin-top': -liHeight + 'px' },
        scrollSpeed,
        function() {
          $noticeContext
            .css({ 'margin-top': '0px' })
            .find('li:first')
            .appendTo($noticeContext);
        }
      );
    };
    setInterval(function() {
      noticeScrollUp($noticeBox);
    }, scrollSpace);
  },
  init: function(opt) {
    baiduTrackEvent('openPageTurntable');//进入蜜芽转盘活动H5页面
    var me = this;
    if (!!me._init) {
      return me;
    }
    let option = $.extend({}, opt, {
      positionToastValue: '45%',
      exchangePrizesByChild: true,
      miyaTurntableRegister: true,
      exchangePrizesByChildFun: function() {
        if ($registerForm.hasClass('hide')) {
          if (count === 1) {
            baiduTrackEvent('600Popup1button1');//进入蜜芽转盘短验页面
            $turntableShade.removeClass('hide');
            $exchangeDialog
              .removeClass('prizes-six register-six prizes-eight hide')
              .addClass('register-eight');
            baiduTrackEvent('600Popup2');
          }

          if (count === 0) {
            baiduTrackEvent('600+850Popup1button1');
            $turntableShade.removeClass('hide');
            $exchangeDialog
              .removeClass('prizes-six prizes-eight register-eight hide')
              .addClass('register-six');
            baiduTrackEvent('600+850Popup2');
            $('.exchange-times')
              .removeClass('hide')
              .siblings('.exchange-draw')
              .addClass('hide');
          }
        }
      },
      successCallback: function() {
        $('#J_landing-turntable-result')
          .removeClass('hide')
          .siblings('#J_landing-turntable-wrap')
          .addClass('hide');
        $('html, body').scrollTop(0);
        baiduTrackEvent('success'); //成功页打开
        if (count === 1) {
          $('.J_prizes-desc-six')
            .removeClass('hide')
            .siblings('.J_prizes-desc-eight')
            .addClass('hide');
        }
        if (count === 0) {
          $('.J_prizes-desc-eight')
            .removeClass('hide')
            .siblings('.J_prizes-desc-six')
            .addClass('hide');
        }
      },
      trackEventVerifycode: function() {
        if (count === 1 ) {
          baiduTrackEvent('600Popup2Messagebutton');
        }
        if (count === 0) {
          baiduTrackEvent('600+850Popup2Messagebutton');
        }
      },
      trackEventSubmit: function() {
        if (count === 1) {
          baiduTrackEvent('600Popup2Submitbutton');
        }
        if (count === 0) {
          baiduTrackEvent('600+850Popup2Submitbutton');
        }
      },
      trackEventDownload: function() {
        baiduTrackEvent('miya-turntable-downloadapp');
      },
      mobileHadSign: function(message) {
        if(message === '该手机号已经绑定'){
          this.successCallback();
          return true;
        }
        return false;
      }
    });
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
    if(isAndroid){
      $('#J_smscode').on('focus', function() {
        gotoTopTurntable('270px');
      });
      $('#J_mobile').on('focus', function() {
        gotoTopTurntable('250px');
      });
      $('#J_mobile, #J_password').on('blur', function() {
        gotoTopTurntable('0px');
      });
    }
    landingSignupStep.init(option);
    me.noticeScroll();
    me.tiggerTurntableEvent();
    me._init = true;
    return me;
  }
};

exports = module.exports = landingMiyaTurntable;