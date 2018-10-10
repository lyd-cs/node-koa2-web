import * as util from './util';
import heartBeat from './heartBeat';
import Riskvail from './riskvail';
import CallApp from './callApp';
import Download  from './download';
import Questions from './questions';
import LandingAbout from './landing.about';
import LandingInvite from './landing.invite';
import landingOrdinary from './landing.ordinary';
import landingMiyaSignup from './landing.miya.signup';
import landingMiyaTurntable from './landing.miya.turntable';
import registerJdCard from './landing.register.jdcard';
import appInvite from './invite';
import interactive from './interactiveBridge';
import judgeInstallApp from './judgeInstallApp';
import landingCarnival from './landing.carnival';
import aboutPlatform from './about.platform';
import aboutCompany from './about.company';
import popModal from './modal';
import scrollPosition from './about.scroll.position';
import miyaActive from './landing.miya';
import landingWeishaRegister from './landing.register.weisha';
require('../js/customValidate');
require('../lib/jquery.wrapper.countdown.js');

let app = {
  CSRFProtection(xhr){
    let token = $('meta[name="csrf-token"]').attr('content');
    if (token) {
      xhr.setRequestHeader('X-CSRF-Token', token);
    }
  },
  refreshCSRFTokens(){
    let csrfToken = $('meta[name=csrf-token]').attr('content');
    let csrfParam = $('meta[name=csrf-param]').attr('content');
    $('form input[name="' + csrfParam + '"]').val(csrfToken);
  },
  attachCSRF(){
    $.ajaxPrefilter((options, originalOptions, xhr) => {
      if (!options.crossDomain) {
        app.CSRFProtection(xhr);
      }
    });
    app.refreshCSRFTokens();
  },
  util: util.default,
  heartBeat,
  init(){
    app.attachCSRF();
    app.heartBeat();
  },
  riskvail: Riskvail,
  callApp: CallApp,
  download: Download,
  questions: Questions,
  landingAbout: LandingAbout,
  landingInvite: LandingInvite,
  landingOrdinary,
  landingMiyaSignup,
  landingMiyaTurntable,
  appInvite: appInvite,
  interactive,
  landingCarnival: landingCarnival,
  judgeInstallApp,
  aboutPlatform,
  aboutCompany,
  popModal,
  registerJdCard,
  scrollPosition,
  miyaActive,
  landingWeishaRegister
};

if (!window['app']) {
  window['app'] = app;
  app.init();
}

$(function() {
  FastClick.attach(document.body);
});

$('.J_countdown').countdown({
  onEnd: function() {
    location.reload();
  },
  render: function(date) {
    var ret = [];
    var ele = $(this.el);
    var _add = function(str, flag) {
      return ret.push(['<span class="num">', str, '</span>', flag].join(''));
    };
    var _render = function() {
      var str = ret.join('');
      var key = 'countdown_cache';
      var cache = ele.data(key);
      if (cache && cache.length == str.length && cache == str) {
        return;
      }
      return ele.data(key, str).html(str);
    };
    // for 60 sec
    if (date.sec == 60) {
      date.min += 1;
      date.sec = 0;
    }
    if (date.days > 0) {
      _add(this.leadingZeros(date.days, 2), '天');
      _add(this.leadingZeros(date.hours, 2), '小时');
    } else if (date.days == 0 && date.hours > 0) {
      _add(this.leadingZeros(date.hours, 2), '小时');
      _add(this.leadingZeros(date.min, 2), '分');
    } else {
      _add(this.leadingZeros(date.min, 2), '分');
      _add(this.leadingZeros(date.sec, 2), '秒');
    }
    return _render();
  }
});

export default app;
