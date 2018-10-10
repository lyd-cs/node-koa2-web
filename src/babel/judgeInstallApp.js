var u = window.navigator.userAgent;

var createIframe = (function(){
  var iframe;
  return function(){
    if(iframe){
      return iframe;
    }else{
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      return iframe;
    }
  };
})();

function isIOS9() {
  //获取固件版本
  var getOsv = function() {
    var reg = /OS ((\d+_?){2,3})\s/;
    if (u.match(/iPad/i) || navigator.platform.match(/iPad/i) || u.match(/iP(hone|od)/i) || navigator.platform.match(/iP(hone|od)/i)) {
      var osv = reg.exec(navigator.userAgent);
      if (osv.length > 0) {
        return osv[0].replace('OS', '').replace('os', '').replace(/\s+/g, '').replace(/_/g, '.');
      }
    }
    return '';
  };
  var osv = getOsv();
  var osvArr = osv.split('.');
  //初始化显示ios9引导
  if (osvArr && osvArr.length > 0) {
    if (parseInt(osvArr[0]) >= 9) {
      return true;
    }
  }
  return false;
}

function isWeiXin() {
  return !!u.match(/MicroMessenger/i);
}

function isQQ() {
  return !!u.match(/QQ/i);
}

function isIos() {
  return !!u.match(/CPU.+Mac OS X/);
}

function isAndroid() {
  return u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
}

function isChrome() {
  return u.indexOf('Chrome') !== -1;
}

function isPC() {
  var Agents = ['Android', 'iPhone',
    'SymbianOS', 'Windows Phone',
    'iPad', 'iPod'];
  var flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (u.indexOf(Agents[v]) > 0) {
      flag = false;
      break;
    }
  }
  return flag;
}

function openOrDownloadApp(opt= {}) {
  var localUrl = opt.localUrl || 'hoomsun://m.hxb.com/';
  var androidUrl = opt.androidUrl || 'http://a.app.qq.com/o/simple.jsp?pkgname=com.hoomsun.hxb';
  var iosUrl = opt.iosUrl || 'https://itunes.apple.com/cn/app/hong-xiao-bao/id1119411654?mt=8';
  var pcDownloadUrl = opt.pcDownloadUrl || 'https://www.hoomxb.com/app';
  var openIframe;
  if(isIos()){
    if (isWeiXin() || isQQ()) {
      location.href = iosUrl;
    }
    if(isIOS9()){
      location.href = localUrl;
    }
    location.href = localUrl;
    var loadDateTime = Date.now();
    setTimeout(function() {
      var timeOutDateTime = Date.now();
      if (timeOutDateTime - loadDateTime < 1000) {
        location.href = iosUrl;
      }
    }, 25);
  }else if(isAndroid()){
    openIframe = createIframe();
    if (isWeiXin() || isQQ()) {
      location.href = androidUrl;
    } else if (isChrome()) {
      location.href = localUrl;
    } else {
      openIframe.src = localUrl;
    }
    setTimeout(function() {
      location.href = androidUrl;
    }, 500);
  }else if(isPC()){
    location.href = pcDownloadUrl;
  }
}

export default {
  openOrDownloadApp,
  createIframe
};