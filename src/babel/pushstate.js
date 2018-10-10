// push state
let global = window;
let windowHistory = global.history;
let historyPushState = windowHistory.pushState;
let historyReplaceState = windowHistory.replaceState;

//let isSupportHistoryAPI = isSupportHistoryAPIDetect();
//let isSupportStateObjectInHistory = 'state' in windowHistory;

// function isSupportHistoryAPIDetect(){
//   //https://github.com/devote/HTML5-History-API/blob/master/history.js
//   var ua = global.navigator.userAgent;
//   // We only want Android 2 and 4.0, stock browser, and not Chrome which identifies
//   // itself as 'Mobile Safari' as well, nor Windows Phone (issue #1471).
//   if ((ua.indexOf('Android 2.') !== -1 ||
//     (ua.indexOf('Android 4.0') !== -1)) &&
//     ua.indexOf('Mobile Safari') !== -1 &&
//     ua.indexOf('Chrome') === -1 &&
//     ua.indexOf('Windows Phone') === -1)
//   {
//     return false;
//   }
//   //window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/)
//   //window.history && window.history.pushState && window.history.replaceState &&
//   // // pushState isn't reliable on iOS until 5.
//   //!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]\D|WebApps\/.+CFNetwork)/)

//   // !(
//   // (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
//   //  || (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
//   // )
//   // Return the regular check
//   return !!historyPushState;
// }

export function pushState(){
  historyPushState && historyPushState.apply(windowHistory, arguments);
}

export function replaceState(){
  historyReplaceState && historyReplaceState.apply(windowHistory, arguments);
}