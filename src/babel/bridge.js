//WebViewJavascriptBridge

let Bridge;

let isBridge = false;
let registerHandlers = [];
let callHandlers = [];

function connectWebViewJavascriptBridge(callback) {
  if (window.WebViewJavascriptBridge) {
    callback(WebViewJavascriptBridge);
  } else {
    document.addEventListener('WebViewJavascriptBridgeReady', function() {
      callback(WebViewJavascriptBridge);
    }, false);
  }
}

function connectWebViewJavascriptBridgeCallback(bridge) {
  Bridge = bridge;
  isBridge = true;
  // bridge init
  bridge.init((data, callback) => {
    if (callback) {
      callback();
    }
  });
  // bridge registerHandler
  registerHandlers.forEach((x) => {
    bridge.registerHandler.apply(bridge, x);
  });
  // bridge callHandler
  callHandlers.forEach((x) => {
    bridge.callHandler.apply(bridge, x);
  });
}

function init() {
  connectWebViewJavascriptBridge(connectWebViewJavascriptBridgeCallback);
}

// init
init();

export default {
  get isBridge() {
    return isBridge;
  },
  registerHandler() {
    if (Bridge && Bridge.registerHandler) {
      return Bridge.registerHandler.apply(Bridge, arguments);
    }
    registerHandlers.push(arguments);
  },
  callHandler() {
    if (Bridge && Bridge.callHandler) {
      return Bridge.callHandler.apply(Bridge, arguments);
    }
    callHandlers.push(arguments);
  }
};