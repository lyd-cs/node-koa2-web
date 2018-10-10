'use strict';

/**
 * user
 */
const request = require('../lib/request.js');
const { config } = require('../lib/util.js');

const API_BASE = config.apiBase;
const ERROR_ACTION_URL = 'ERROR_ACTION_URL';


module.exports = {
  update(values, action = 'def') {
    let map = {
      // 短信验证码 提现 获取验证码 http://doc.hoomxb.com/index.php?s=/1&page_id=301
      'verifycode/sms/withdraw': '/paycenter/getCashDrawMobileVerificationCode',
      // 短信验证码 充值 获取验证码 http://doc.hoomxb.com/index.php?s=/1&page_id=278
      'verifycode/sms/recharge': '/escrow/recharge/getWithHoldMobileVerificationCode',
      // 短信验证码 http://doc.hoomxb.com/index.php?s=/1&page_id=16
      'verifycode/sms': '/login/gensmscode',
      // 语音验证码 http://doc.hoomxb.com/index.php?s=/1&page_id=16
      'verifycode/voice': '/login/getAudioCode',
      // 注册
      'signup': '/login/register',
      'def': '/login/getAudioCode'
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });
  },
  fetch(values, action = 'def') {
    let map = {
      //校验短信验证码 http://doc.hoomxb.com/index.php?s=/1&page_id=21
      'verifycode/check': '/login/validateSmsCode',
      //获取微信signature
      'getWechatSignature':'/weixin/getSignature',
      //注册Post
      'userSignupPost':'/login/register',
      'def': '',
    };
    let url = action && map[action];
    if (!url) {
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });
  },
  query(values, action = 'def'){
    let map = {
      //校验手机号
      'userCheckMobile': '/login/checkRepeatMobile',
      //发送手机验证码
      'sendValidateCode': '/login/gensmscode',
      //京东卡用户查看
      'userJdCard': '/activity/getActivityCard',
      'def': ''
    };
    let url = action && map[action];
    if(!url){
      throw new Error(ERROR_ACTION_URL);
    }
    return request(url, {
      method: 'POST',
      form: values,
      baseUrl: API_BASE
    });

  }
};
