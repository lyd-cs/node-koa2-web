/**
 * errormsg
 */
var ErrMsg = {
  // def
  def: '操作失败，稍后重试',
  // login
  login: '请输入正确的用户名和密码',
  loginCount: '登录失败次数过多,请稍后再试',
  loginPassword: '密码不正确',
  emptyPassword: '密码不能为空',
  isLogin: '请登录后操作',
  // mobile
  isMobile: '请输入正确的手机号码',
  emptyMobile: '请输入手机号码',
  equalMobile: '手机号码不能和当前相同',
  mobileExists: '该手机号已注册',
  trialActivityMobileExists: '此活动仅限新用户参加',
  mobileNotExists: '手机号码不存在',
  noRegister: '该账号未被注册',
  isHeroRate: '请输入收益率',
  // captcha
  isCaptcha: '请输入正确的验证码',
  isCaptchaCorrect: '请输入正确的图形验证码',
  lenCaptcha: '请输入正确的验证码',
  expireCaptcha: '验证码过期，请重新获取',
  emptyCaptcha: '图形验证码不能为空',
  // smscode
  isCode: '请输入正确的手机验证码',
  emptyCode: '请输入手机验证码',
  isSmsCode: '请输入正确的短信验证码',
  quickSmsCode: '验证码发送过于频繁，1分钟后再试',
  lenSmsCode: '请输入正确的手机验证码',
  unavailableVoiceSmsCode: '语音验证码暂不可用，请更新版本',
  // nickname
  isNickName: '请输入正确的昵称',
  emptyNickName: '请输入昵称,2-12个字符',
  nickNameExists: '昵称已存在',
  lenNickName: '2-12个字符',
  // password
  isPwd: '密码长度应为8-20位',
  emptyPwd: '请输入密码',
  emptyCurrentPwd: '请输入当前密码',
  emptyRePwd: '请输入确认密码',
  emptyNewPwd: '新密码不能为空',
  emptyReNewPwd: '重复密码不能为空',
  lenPwd: '密码长度8-20个字符',
  rePwd: '两次输入密码不一致',
  currentPwd: '当前密码不正确',
  purePwd: '密码不能是纯数字或纯字母',
  equalPwd: '新密码不能原密码相同',
  lenNewPwd: '新密码长度8-20个字符',
  illegalPwd: '密码不能包含特殊字符',
  lenTradPwd: '6位数字交易密码',
  isFormatTradPwd: '交易密码格式不正确',
  // realname
  isRealname: '请输入正确的姓名',
  emptyRealname: '请输入真实姓名',
  isEmptyUserId: '用户id不能为空',
  // Identity
  isIdentity: '身份证号码不正确',
  emptyIdentity: '请输入身份证号',
  isMateIdentity: '请输入正确的身份证号',
  // Trusted
  isTrusted: '请先进行实名认证',
  articleError: '暂无数据',
  productNoError: '暂无数据',
  // buy
  requireUserBalance: '可用金额不足',
  requireWinBalance: '可投金额不足',
  buySelf: '不能购买自己申请的项目',
  buyFailed: '购买失败',
  isBuy: '请输入出借金额',
  minBuy: '最小出借金额为1000',
  isMinbiddingamount: '未达最小起投金额',
  isBid: '此产品不可加入，请选择其他产品',
  isBidding: '此产品已满额，请选择其他产品',
  isNonBiddingTime: '未在投标时间范围内',
  isAmount: '出借金额不能为空',
  isEmptyBuyType: '购买类型不能为空',
  isBuyTypeErr: '购买类型有误',
  isInsufficientAllowance: '您本期剩余可出借金额不足',
  // product
  isProductEmptyId: '产品ID不能为空',
  isProductIdInt: '产品ID应为整数',
  // withdraw
  isEmptyAmount: '提现金额不能为空',
  withdrawError: '提现金额不能小于1元',
  isEmptyTradPwd: '交易密码不能为空',
  isCash: '金额不正确且只保留两位小数',
  isBankCardId: '卡号不正确',
  isBankIdEmpty: '银行卡号不能为空',
  isAmountError: '提现金额不能超过可用余额',
  isBindBankCard: '已经绑定过银行卡',
  //account balance
  isEmptyBalance: '账户余额不能为空',
  // charge
  isEmptyCharge: '充值金额不能为空',
  rechargeError: '充值金额不能小于1元',
  isEmpTyBankNo: '银行编号不能为空',
  chargeResponseTimeout: '您稍后可在账户内查看',
  // smscode
  isEmptySmsCode: '短信验证码不能为空',
  sendVerifyCodeError: '发送短信验证码失败',
  lenSmsError: '验证码输入有误',
  isEmptySmsCodeType: '发送验证码类型不能为空',
  isActionError: '发送短信类型有误',
  // update
  isEmptyVersion: '暂未找到相关版本号',
  isVersionRuler: '版本号有误',
  isNewestVersionError: '新版本配置内容有误',
  isSpecificVersionError: '指定版本配置发生错误',
  //risk
  isEmptyRiskScore: '风险测评分数不能为空',
  noRiskEvaluation: '未做过风险测评',
  riskWarn: '请勾选同意风险提示',
  //type
  isEmptyType: '请求类型不能为空',
  //escrow Account
  isCreateEscrowAcc: '已经开通过存管账户',
  notOpenEscrowAcc: '未开通存管账户',
  escrowAccImperfectInfo : '存管账户信息不完善',
  escrowTimeOut: '开户次数已达上限，请联系客服开户',
  //recharge order number
  isEmptyRechargeOrderNum: '原始充值订单号不能为空',
  //invitation code
  invitationCodeError: '邀请码格式有误',
  isEmptyInviteCode: '邀请码不能为空',
  isInviteCode: '邀请码有误',
  isEmptyBankName: '银行名称不能为空',
  isNumber: '不能包含特殊字符',
  //banknumber
  isBankNumber: '请输入正确的银行卡号',
  isDebitBankCard: '不支持绑定信用卡，请使用储蓄卡进行绑定',
  isBankTypePassed: '暂不支持该银行',
  //staff
  isStaffId: '未查询到该邀请码，请重新输入',
  isEmptyStaffId: '获取邀请码失败',
  // transfer
  isEmptyTransferValue: '当前债权价值不能为空',
  //app specify error
  isTimestampErr: '您的手机时间不在地球上，请检查后使用',
  isNotLogin: '您还未登录，请先登录红小宝',
  //coupon
  isCouponCode: '请输入正确的兑换码',
  isEmptyCouponCode: '兑换码不能为空',

  // account/invite
  inviteForbidMsg: '本功能仅供用户使用，员工请通过专属邀请码推荐用户注册，如有疑问请拨打红小宝客服热线400-1552-888。',
  inviteVersionJudge: '邀请好友功能仅限2.3以上版本使用，请更新APP至最新版本',
  inviteActivityOver: '本期邀请好友活动已结束',

  // 散标安全等级描述
  loanDetailSecurityLevel: '安全等级根据借款人的身份信息、资质审核及历史信用等级综合判定得出。红小宝平台始终秉持客观、公正、严谨的原则，最大程度的核实借款人信息真实性。当借款人丧失还款能力，或者借款人的还款意愿发生变化时，出借人的本金和收益资金可能无法部分或全部回收。网贷有风险，出借需谨慎。'
};


module.exports = ErrMsg;
