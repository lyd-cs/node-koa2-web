// @see https://babeljs.io/docs/learn-es2015/
import accounting from 'accounting';

import ErrMsg from '../../lib/errormsg';
import webviewBridge from './bridge';
import wxShare from './wxshare';
import Form from '../js/form';
import wx from './weixin';
import statistics from './statistics';

let reAmount = /^(?:[1-9][0-9]*)0{3}$/;
let reMobile = /^1[3|4|5|6|8|7|9][0-9]{9}$/;
let reNickName = /^[\u4E00-\u9FA5A-Za-z0-9_]{2,12}$/;
let replaceMobile = /^(\d{3})(.*)(\d{4})$/;
let safeMobile = function(val) {
  if (!val || val.length < 7) {
    return '****';
  }
  return val.replace(replaceMobile, '$1****$3');
};

accounting.settings.currency.format = '%v';

function isIos() {
  return !!window.navigator.userAgent.match(/CPU.+Mac OS X/);
}

export default {
  accounting,
  toFixed: accounting.toFixed,
  formatNumber: accounting.formatNumber,
  formatMoney: accounting.formatMoney,
  ErrMsg,
  Form,
  wxShare,
  webviewBridge,
  wx,
  reAmount,
  reMobile,
  reNickName,
  safeMobile,
  statistics,
  isIos
};