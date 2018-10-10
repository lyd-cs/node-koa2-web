'use strict';

var option;

var accountShare = {
  qqFriend: function(content){
    var s = [];
    for (var i in content) {
      s.push(i+'='+encodeURIComponent(content[i] || ''));
    }
    var url='http://connect.qq.com/widget/shareqq/index.html?'+s.join('&');
    return url;
  },
  qqZone: function(content){
    var s = [];
    for (var i in content) {
      s.push(i+'='+encodeURIComponent(content[i] || ''));
    }
    var url='http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?'+s.join('&');
    return url;
  },
  handlerClick: function(){
    var me = this;
    $('#J_qq-zone').click(function(){
      option.shareInfo.url = location.protocol+'//'+location.host+'/landing/invite/' + userId+'?utmSource=PC-1003';
      var _url = me.qqZone(option.shareInfo);
      window.open(_url);
    });
    $('#J_qq-friend').click(function(){
      option.shareInfo.url = location.protocol+'//'+location.host+'/landing/invite/' + userId+'?utmSource=PC-1002';
      var _url = me.qqFriend(option.shareInfo);
      window.open(_url);
    });
    $('#J_copy-btn').click(function(){
      var url = document.getElementById('J_interlink-val');
      url.select();
      document.execCommand('Copy');
      $('.J_copy-success').show();
      setTimeout(function(){
        $('.J_interlink .interlink-invite-box').hide();
      }, 1000);
    });
    $('.J_interlink').hover(function(){
      $('.J_interlink .interlink-invite-box').show();
      $('#J_interlink-val').val(location.protocol+'//'+location.host+'/landing/invite/'+option.userId+'?utmSource=PC-1004');
    }, function(){
      $('.J_copy-success').hide();
      $('.J_interlink .interlink-invite-box').hide();
    });

  },
  init: function(opt){
    var me = this;
    if ( !!me._init ) {
      return me;
    }
    option = $.extend({}, opt);
    me.handlerClick();
    me._init = true;
    return me;
  }
};

exports = module.exports = accountShare;