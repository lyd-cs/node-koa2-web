import webviewBridge from './bridge';

export default {
  openAppPage(params) {
    webviewBridge.callHandler('startPage', params);
  },
  openAppH5Page(params) {
    webviewBridge.callHandler('startH5Page', params);
  },
  share(params) {
    webviewBridge.callHandler('share', params);
  },
  showMessage(params) {
    webviewBridge.callHandler('showMessage', params);
  },
};