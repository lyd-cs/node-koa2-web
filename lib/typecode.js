//产品购买确认页错误提示
exports.BUY_CONFIRM_ERROR = {
  'ERRPASSWORD': 3014,
  'ERRSMSCODE': 3015
};

//计划、散标债权购买类型
exports.BUY_TYPE = {
  'BALANCE': 1, //余额购买
  'RECHARGE': 2 //银行卡充值购买
};

//app产品购买特殊错误码
exports.PRODUCT_BUY_ERROR_CODE = {
  '3014': '交易密码错误',
  '3015': '短信验证码错误',
  '3408': '余额不足',
  '999': '已售罄',
  '-999': '购买结果处理中',
  '3513': '去认证',
  '3016': '充值结果正在恒丰银行处理中',
  '3413': '购买过于频繁'
};

//app获取客户端请求参数错误提示
exports.APP_CLIENT_PARAMS_ERROR = 104;