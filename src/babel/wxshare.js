//wxshare
//let CACHE = {};
let $el = {};
let option;


let defaultOption = {
  context: 'body',
  selector: '#J_wx-share',
  className: {
    active: 'active',
    open: 'modal-open',
    browser: ' wx-share-safari'
  },
};
let ua = window.navigator.userAgent;

function create(){
  $el.instance = $('<div id="J_wx-share" class="wx-share"></div>').appendTo(
    $el.context
  );
  $el.instance.on('click', ()=> hide());
  return $el.instance;
}

function getInstance(){
  if($el.instance && $el.instance.length){
    return $el.instance;
  }
  if($el.selector && $el.selector.length){
    return $el.instance = $el.selector;
  }
  return create();
}

function browser(){
  let ele = getInstance();
  let isWeixin = ua.match(/MicroMessenger/)?true:false;
  // 微信提示在safari中打开
  if (isWeixin) {
    $(ele).addClass(option.className.browser);
    show();
  }else{
    hide();
  }
}

function show(){
  let ele = getInstance();
  $(ele).addClass(option.className.active);
  $el.context.addClass(option.className.open);
}

function hide(){
  let ele = getInstance();
  $(ele).removeClass(option.className.active);
  $el.context.removeClass(option.className.open);
}

function init(opt){
  option = $.isPlainObject(opt)
    ? $.extend(true, {}, defaultOption, opt)
    : $.extend({}, defaultOption);
  ['context', 'selector'].forEach((v) => $el[v] = $(option[v]));
  if( !opt ){
    show();
  }
  if ( opt == 'hide' ) {
    hide();
  }
  if ( opt == 'show' ) {
    show();
  }
  if ( opt == 'browser') {
    browser();
  }
  return {
    show,
    hide,
    browser
  };
}

export default function(opt){
  return init(opt);
};