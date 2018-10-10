'user strict';

var download = {
  goDownload: function(opt) {
    var me = this;
    var u = navigator.userAgent;
    var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Linux') > -1;
    var isIOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    var isWeixn = me.isWeixn();
    var isPC = me.isPC();
    var androidDownloadUrl = opt.androidDownload;
    var iosDownloadUrl = opt.iosDownload;
    if (isAndroid) {
      location.href = androidDownloadUrl;
    }
    if (isIOS) {
      location.href = iosDownloadUrl;
    }
    if (isWeixn) {
      $('.J_download-wechat').addClass('wechat');
    }
    if (isPC) {
      location.href = androidDownloadUrl;
    }
  },
  isWeixn: function() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      return true;
    } else {
      return false;
    }
  },
  isPC: function() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
      if (userAgentInfo.indexOf(Agents[v]) > 0) {
        flag = false;
        break;
      }
    }
    return flag;
  },
  init: function(opt) {
    var me = this;
    me.goDownload(opt);
  }
};

exports = module.exports = download;