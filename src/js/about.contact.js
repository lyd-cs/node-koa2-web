'use strict';

var markerArr = [{title:'红上金融信息服务（上海）有限公司',content:'上海市黄浦区外滩SOHO A座',point:'121.500499|31.236015',isOpen:1,icon:{w:32,h:43,l:0,t:0,x:6,lb:5}}];
var aboutContant = {
  createMap: function(){
    var map = new BMap.Map('J_map-content');
    var point = new BMap.Point(121.500871,31.236424);
    map.centerAndZoom(point,18);
    window.map = map;
  },
  setMapEvent: function(){
    map.enableDragging();
    map.enableScrollWheelZoom();
    map.enableDoubleClickZoom();
    map.enableKeyboard();
  },
  addMapControl: function(){
    var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
    map.addControl(ctrl_nav);
    var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
    map.addControl(ctrl_ove);
    var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
    map.addControl(ctrl_sca);
  },
  addMarker: function(){
    var me = this;
    for(var i=0;i<markerArr.length;i++){
      var json = markerArr[i];
      var p0 = json.point.split('|')[0];
      var p1 = json.point.split('|')[1];
      var point = new BMap.Point(p0,p1);
      var iconImg = me.createIcon(json.icon);
      var marker = new BMap.Marker(point,{icon:iconImg});
      var label = new BMap.Label(json.title,{'offset':new BMap.Size(json.icon.lb-json.icon.x+10,-20)});
      marker.setLabel(label);
      map.addOverlay(marker);
      label.setStyle({
        borderColor:'#808080',
        color:'#333',
        cursor:'pointer'
      });
      (function(){
        var _iw = me.createInfoWindow(i);
        var _marker = marker;
        _marker.addEventListener('click',function(){
          this.openInfoWindow(_iw);
        });
        _iw.addEventListener('open',function(){
          _marker.getLabel().hide();
        });
        _iw.addEventListener('close',function(){
          _marker.getLabel().show();
        });
        label.addEventListener('click',function(){
          _marker.openInfoWindow(_iw);
        });
        if(!!json.isOpen){
          label.hide();
          _marker.openInfoWindow(_iw);
        }
      })();
    }
  },
  createInfoWindow: function(i){
    var json = markerArr[i];
    var iw = new BMap.InfoWindow('<b class="iw_poi_title" title=' + json.title + '>' + json.title + '</b><div class="iw_poi_content">'+json.content+'</div>');
    return iw;
  },
  createIcon: function(json){
    var icon = new BMap.Icon('/img/about-map.png', new BMap.Size(json.w,json.h),{imageOffset: new BMap.Size(-json.l,-json.t),infoWindowOffset:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.x,json.h)});
    return icon;
  },
  init: function(){
    var me = this;
    me.createMap();
    me.setMapEvent();
    me.addMapControl();
    me.addMarker();
  }
};

exports = module.exports = aboutContant;