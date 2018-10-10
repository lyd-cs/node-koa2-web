//weixin
// import { replaceState } from './pushstate'

// let CACHE = {};
// let $el = {};
let option;

let defaultImgUrl = getUrl('/img/mobile/logo.jpg');
let defaultOption = {};

function getUrl(url){
  var a = document.createElement('a');
  a.href = url||'';
  return a.href;
}

function getSign(){
  $.post('/api/weixin/sign', {url: getUrl()})
  .done((json) => {
    if (json.status===0){
      init(json.data);
      return;
    }
    //setTimeout(getSign, 0);
  });
}

function bind() {
  var data = option;
  wx.onMenuShareTimeline(data);
  wx.onMenuShareAppMessage(data);
  wx.onMenuShareQQ(data);
  wx.onMenuShareWeibo(data);
  wx.onMenuShareQZone(data);
}

function init(data){
  // http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html
  wx.config({
    appId: data.appId || '',
    timestamp: data.timestamp || '',
    nonceStr: data.nonceStr || '',
    signature: data.signature || '',
    jsApiList: [
      'onMenuShareTimeline',
      'onMenuShareAppMessage',
      'onMenuShareQQ',
      'onMenuShareWeibo',
      'onMenuShareQZone'
    ]
  });
  wx.ready(bind);
  wx.error(getSign);
}

export default {
  init(opt) {
    option = $.isPlainObject(opt)
      ? $.extend(true, {}, defaultOption, opt)
      : $.extend({}, defaultOption);
    option.title = opt['title'] || document.title;
    option.link = opt.link ? getUrl(opt.link) : location.href;
    option.imgUrl = opt.imgUrl? getUrl(opt.imgUrl) : defaultImgUrl;
    option.desc = opt.desc || option.title;
    ['success', 'cancel'].forEach((v) => {
      if ( opt[v] ) {
        option[v] = opt[v];
      }
    });

    getSign();
  },
};
