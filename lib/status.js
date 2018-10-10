'use strict';

const ERROR_TYPE_PROCESSING = 'PROCESSING';
const ERROR_TYPE_RESULT = 'RESULT';
const ERROR_TYPE_TOAST = 'TOAST';

function Status(code){
  if(!code){
    return ERROR_TYPE_TOAST;
  }
  if(Status.processing[code]){
    return ERROR_TYPE_PROCESSING;
  }
  if(Status.result[code]){
    return ERROR_TYPE_RESULT;
  }
  return ERROR_TYPE_TOAST;
};

Status[Status['SUCCESS'] = 0] = 'success';
Status[Status['FAIL'] = 1] = '操作失败，请稍后重试';
Status[Status['PARAMS_REQUIRED'] = 2] = 'params requried';

// http status
Status[Status['TOKEN_REQUIRED'] = 401] = '无token权限';
Status[Status['LOGIN_REQUIRED'] = 402] = '未登录';


Status[Status['VERIFY_CODE'] = 102] = '图形验证码不能为空';
Status[Status['PARAMS_FAIL'] = 104] = 'params fail';

Status[Status['CAPTCHA_EXPIRE'] = 411] = '验证码过期，请重新获取';
Status[Status['TIMESTAMP_FAIL'] = 412] = '未登录';
Status[Status['SERVER_FAIL'] = 500] = '服务器错误，请稍后重试';

// 后面是后端输出的特定错误码，需要重写message;
Status[Status['BUY_PROCESSING'] = -999] = '购买结果处理中';
Status[Status['SOLD_OUT'] = 999] = '已售罄';

Status[Status['TRAD_PASSWORD'] = 3014] = '交易密码错误';
// 宝付所有错误都在这里
Status[Status['SMS_CDOE'] = 3015] = '';
Status[Status['CHARGE_PROCESSING'] = 3016] = '充值结果正在恒丰银行处理中';
// 今日发送次数已达上限，请明日重试
Status[Status['VERIFYCODE_OUT_LIMIT'] = 3232] = '';
Status[Status['BLANCE_AMOUNT'] = 3408] = '余额不足';
Status[Status['BUY_TOO_OFTEN'] = 3413] = '购买过于频繁';

Status[Status['AUTH_REQUIRED'] = 3513] = '去认证';

// 银行卡第三方解绑出错
Status[Status['BACKCARD_THIRD_PARTY_UNBIND_FAIL'] = 4002] = '';

// 开户超过限定次数
Status[Status['ESCROW_OVER_TIMES'] = 5068] = '';

// null 或者 '' 只定制错误码，不定制消息，消息时候用后端消息
Status[Status['BUY_WITH_COUPONT_FAIL'] = 50000] = '';

// app 显示处理中页面
Status.processing = {
  '-999': true,
  3016: true,
};

// app 显示结果页
Status.result = {
  999: true,
  3408: true,
};

module.exports = Status;
