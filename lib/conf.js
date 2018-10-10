/**
 * 枚举转换
 */
const _ = require('lodash');

// 渠道用户
exports.CHANNEL_USER_CODE = {
  'DEBX_ZHIXIN': '红上至信',
  'FROM_WEBSITE': '普通用户',
};
// 产品类型
exports.PRODCUT = {
  'ZHIXIN': '至信',
};
// 标的状态
exports.LOAN_STATUS = {
  'OPEN': {'code': 'OPEN', 'name': '投标中'},
  'READY': {'code': 'READY', 'name': '已满标'},
  'FAILED': {'code': 'FAILED', 'name': '已流标'},
  'IN_PROGRESS': {'code': 'IN_PROGRESS', 'name': '收益中'},
  'OVER_DUE': {'code': 'OVER_DUE', 'name': '逾期'},
  'BAD_DEBT': {'code': 'BAD_DEBT', 'name': '坏账'},
  'CLOSED': {'code': 'CLOSED', 'name': '已结清'},
  'FIRST_APPLY': {'code': 'FIRST_APPLY', 'name': '新申请'},
  'FIRST_READY': {'code': 'FIRST_READY', 'name': '已满标'},
  'PRE_SALES': {'code': 'PRE_SALES', 'name': '预售'},
  'WAIT_OPEN': {'code': 'WAIT_OPEN', 'name': '等待招标'},
  'FANGBIAO_PROCESSING': {'code': 'FANGBIAO_PROCESSING', 'name': '放款中'},
  'LIUBIAO_PROCESSING': {'code': 'LIUBIAO_PROCESSING', 'name': '流标中'},
};
// 还款类型
exports.LOAN_TYPE = {
  'DEBX': '等额本息',
};
// 还款方式
exports.LOAN_REPAID_TYPE = {
'IN_REPAY': '提前还款',
'COMMON_REPAY': '正常还款',
'OVER_DUE_REPAY': '逾期还款',
};
//婚姻状态
exports.LOAN_DETAIL_MARRIAGE_STATUS = {
  'MARRIED': '已婚',
  'UNMARRIED': '未婚',
  'DIVORCED': '离异',
  'WIDOWED': '丧偶',
};

// 投标方式
exports.LOAN_LENDER_TYPE = {
  'NORMAL_BID': '普通投标',
  'FINANCEPLAN_BID': '理财计划投标',
};
// 计划状态
exports.PLAN_STATUS = {
  '0': {'code': 'BOOKFAR', 'name': '等待预售开始超过30分'},
  '1': {'code': 'BOOKNEAR', 'name': '等待预售开始小于30分钟'},
  '2': {'code': 'BOOK', 'name': '预定'},
  '3': {'code': 'BOOKFULL', 'name': '预定满额'},
  '4': {'code': 'WAIT_OPEN', 'name': '等待开放购买大于30分钟'},
  '5': {'code': 'WAIT_RESERVE', 'name': '等待开放购买小于30分钟'},
  '6': {'code': 'OPENING', 'name': '开放加入'},
  '7': {'code': 'OPEN_FULL', 'name': '加入满额'},
  '8': {'code': 'PERIOD_LOCKING', 'name': '收益中'},
  '9': {'code': 'PERIOD_OPEN', 'name': '开放期'},
  '10': {'code': 'PERIOD_CLOSED', 'name': '已退出'},
  '11': {'code': 'PERIOD_EXITING', 'name': '退出中'}
};
//产品购买错误提示
exports.ERROR_CODE = {
  '3408': {'code': 'AMOUNT_SHORT', 'name': '余额不足'},
  '999': {'code': 'SALE_FINISH', 'name': '已售罄'},
  '3513': {'code': 'NOT_SECURITY_CERTIFICATE', 'name': '去认证'},
  '-999': {'code': 'DEBT_PROCESSED', 'name': '处理中'},
  '3016': {'code': 'CHARGE_PROCESSED', 'name': '充值处理中'}
};
//产品购买确认页错误提示
exports.BUY_CONFIRM_ERROR = {
  'ERRPASSWORD' : 3014,
  'ERRSMSCODE' : 3015
};
//计划、散标出借购买类型
exports.BUY_TYPE = {
  'BALANCE': 1, //余额购买
  'RECHARGE': 2 //银行卡充值购买
};
// 计划子账户状态
exports.PLAN_SUB_ACCOUNT_STATUS = {
  'INPROGRESS': '正常',
  'EXITED': '已退出',
  'EXITING': '退出中',
};
// 计划子账户提现类型
exports.PLAN_CASH_TYPE = {
  'HXB': '按月提取收益',
  'INVEST': '收益复投',
};
exports.PLAN_CASH_TYPE_APP = {
  'HXB': '按月提取',
  'INVEST': '收益复投',
};
// 计划子账户交易记录子类型
exports.PLAN_FUND_SUB_TYPE = {
  'RECHARGE': '追加资金',
  'BID_FREEZE': '投标冻结',
  'BID_CHECKOUT': '投标成功',
  'BID_FAILED': '流标退款',
  'REPAID_PRINCIPAL': '回收本金',
  'REPAID_INTEREST': '回收利息',
  'INREPAY_PRINCIPAL': '提前回收本金',
  'INREPAY_INTEREST': '提前回收利息和罚息',
  'BAD_PRINCIPAL': '垫付本金',
  'BAD_INTEREST': '垫付利息',
  'FAXI_OVERDUE': '逾期罚息',
  'CASH_DRAW_FREEZE': '提现冻结',
  'CASH_DRAW_SUCC': '提现成功',
  'CASH_DRAW_FAILED': '提现失败退款',
  'FEE_CASH_DRAW': '提现手续费',
  'REPAID_INTEREST_FEE': '回收利息手续费',
  'INTEREST_REINVESTED': '收益复投',
  'SALE_DEBT': '出售债权',
  'BUY_DEBT': '购买债权',
  'PRINCIPAL_COMPENSATION': '理财计划本金补偿',
  'INTEREST_TO_PRINCIPAL': '收益归集至本金',
  'QUIT_FEE': '退出费用',
  'REPAID_INTEREST_FEE_RETURN': '返还回收利息手续费',
  'ACCRUED_INTEREST_FIX_P2I': '平衡应计利息本金转入利息',
  'ACCRUED_INTEREST_FIX_I2P': '平衡应计利息利息转入本金',
  'CONTINGENCIES_FREEZE': '冻结或有费用',
  'CONTINGENCIES_UNFREEZE': '解冻或有费用',
  'UPLAN_QUIT_ADVANCE_FEE_FREEZE': '冻结理财计划提前退出手续费',
  'UPLAN_QUIT_ADVANCE_FEE_UNFREEZE': '解冻理财计划提前退出手续费',
  'UPLAN_SERVICE_FEE_FREEZE': '冻结理财计划服务费',
  'UPLAN_SERVICE_FEE': '扣除理财计划服务费',
  'AUTOINVESTPLAN_INTEREST_FEE': '回收薪计划利息管理费',
  'AUTOINVESTPLAN_APPLY': '加入薪计划',
  'AUTOINVESTPLAN_RECHARGE': '薪计划充值',
  'START_LOAN_TRANSFER_FREEZE': '理财投标转帐到冻结',
  'LOAN_TRANSFER_FREEZE': '购买债权冻结',
  'LOAN_TRANSFER_UNFREEZE': '购买债权解冻',
  'LOAN_TRANSFER_FAIL_UNFREEZE': '存管失败解冻',
  'REPAID_INTEREST_FEE_FREEZE': '回收利息手续费冻结',
  'AUTOINVESTPLAN_INTEREST_FEE_FREEZE': '回收薪计划利息管理费冻结',
  'AUTO_INVEST_PLAN_OVERDUE_FEE_FREEZE': '冻结薪计划逾期管理费',
  'AUTO_INVEST_PLAN_OVERDUE_FEE_UNFREEZE': '解冻薪计划逾期管理费',
  'AUTO_INVEST_PLAN_INTEREST_FEE': '扣除薪计划利息服务费',
};
// 交易记录类型
exports.FUND_TYPE = {};
// 交易记录资金父类型 PointParentType
exports.FUND_PARENT_TYPE = {
  '0': {'code': 'RECHARGE', 'name': '充值'},
  '1': {'code': 'CASH_DRAW', 'name': '成功提现'},
  '2': {'code': 'LOAN_AND_TRANSFER', 'name': '散标债权'},
  '3': {'code': 'FINANCEPLAN', 'name': '红利智投'}
};
// 交易记录子类型
exports.FUND_SUB_TYPE = {
  '0': {'code': 'RECHARGE', 'name': '充值'},
  '1': {'code': 'CHECKOUT', 'name': '投标成功'},
  '2': {'code': 'CHECKIN', 'name': '招标成功'},
  '3': {'code': 'REPAY', 'name': '偿还本息'},
  '4': {'code': 'REPAID', 'name': '回收本息'},
  '5': {'code': 'IN_REPAY', 'name': '提前还款'},
  '6': {'code': 'IN_REPAID', 'name': '提前回收'},
  '7': {'code': 'CASH_DRAW', 'name': '成功提现'},
  '8': {'code': 'ID_VALIDATE', 'name': '身份验证手续费'},
  '9': {'code': 'CASH_DRAW_FREEZE', 'name': '取现冻结'},
  '10': {'code': 'BID_FREEZE', 'name': '投标冻结'},
  '11': {'code': 'AUTO_BID', 'name': '自动投标'},
  '12': {'code': 'LOAN_FAILED', 'name': '流标退款'},
  '13': {'code': 'CASH_DRAW_FAILED', 'name': '提现失败退款'},
  '14': {'code': 'CASH_DRAW_FEE', 'name': '提现手续费'},
  '15': {'code': 'CHECKIN_MGMT_FEE', 'name': '借款管理费'},
  '16': {'code': 'CHECKIN_MGMT_FEE_4_HOOMSUN', 'name': '借款管理费_人人金服'},
  '17': {'code': 'OVER_DUE_MGMT_FEE', 'name': '逾期管理费'},
  '18': {'code': 'OVER_DUE_MGMT_FEE_4_HOOMSUN', 'name': '逾期管理费_人人金服'},
  '19': {'code': 'ID_VALIDATE_4_HOOMSUN', 'name': '身份验证手续费'},
  '20': {'code': 'CASH_DRAW_FEE_4_HOOMSUN', 'name': '提现手续费'},
  '21': {'code': 'LOAN_START_FEE_4_HOOMSUN', 'name': '成交手续费'},
  '22': {'code': 'RETURN_FEE_FROM_HOOMSUN', 'name': '返还服务费'},
  '23': {'code': 'CASH_DRAW_BY_MANUAL', 'name': '人工提现'},
  '24': {'code': 'MANUAL_RECHARGE', 'name': '人工充值'},
  '25': {'code': 'GUARANTEE_RECHARGE', 'name': '服务费'},
  '26': {'code': 'FIELDAUDIT_RECHARGE', 'name': '实地审核费'},
  '27': {'code': 'ENTURST_RECHARGE', 'name': '委托代查费'},
  '28': {'code': 'REPAID_BY_GUARANTOR', 'name': '坏账垫付'},
  '29': {'code': 'BALANCE_FEE', 'name': '平衡金'},
  '30': {'code': 'REGISTER_FINANCE_PLAN', 'name': '加入U计划'},
  '31': {'code': 'FINANCEPLAN_CASHDRAW', 'name': 'U计划回款'},
  '32': {'code': 'SALE_DEBT', 'name': '出售债权'},
  '33': {'code': 'BUY_DEBT', 'name': '购买债权'},
  '34': {'code': 'LOAN_TRANSFER_FEE', 'name': '债权转让管理费'},
  '35': {'code': 'LOAN_TRANSFER_FEE_FOR_HXB', 'name': '债权转让管理费_红小宝'},
  '36': {'code': 'MARKETING_EVENT_BONUS', 'name': '活动奖励'},
  '37': {'code': 'PRINCIPAL_COMPENSATION', 'name': '本金补偿'},
  '38': {'code': 'QUIT_FEE', 'name': '理财计划退出费用'},
  '39': {'code': 'GUARANTEE_RECHARGE_RETURN', 'name': '返还理财计划利息手续费'},
  '40': {'code': 'FINANCE_PLAN_RESERVE_FREEZE', 'name': 'U计划预定冻结定金'},
  '41': {'code': 'FINANCE_PLAN_RESERVE_OVERDUE_FINE', 'name': 'U计划支付超时扣除定金'},
  '42': {'code': 'FINANCE_PLAN_RESERVE_UNFREEZE', 'name': 'U计划预定解冻'},
  '43': {'code': 'UPLAN_SERVICE_FEE_4_HOOMSUN', 'name': 'U计划服务费'},
  '44': {'code': 'UPLAN_QUIT_ADVANCE_FEE', 'name': 'U计划提前退出费用'},
  '45': {'code': 'UPLAN_QUIT_ADVANCE_FEE_4_HOOMSUN', 'name': 'U计划提前退出费用_红小宝'},
  '46': {'code': 'UPLAN_QUIT_ADVANCE_FEE_DISCARD', 'name': 'U计划提前退出费用_特殊'},
  '47': {'code': 'UPLAN_QUIT_ADVANCE_FEE_4_HOOMSUN_DISCARD', 'name': 'U计划提前退出费用_红小宝_特殊'},
  '48': {'code': 'PAYINSTEAD_FREEZE', 'name': '代付金额冻结'},
  '49': {'code': 'COUPON_4_USER', 'name': '优惠券'},
  '50': {'code': 'COUPON_4_MARKETING', 'name': '优惠券支出'},
  '51': {'code': 'COUPON_4_MARKETING_FREEZE', 'name': '优惠券冻结'},
  '52': {'code': 'COUPON_4_MARKETING_UNFREEZE', 'name': '优惠券解冻'},
  '53': {'code': 'REGISTER_AUTO_INVEST_PLAN', 'name': '加入薪计划'},
  '54': {'code': 'RECHARGE_AUTO_INVEST_PLAN', 'name': '支付薪计划'},
  '55': {'code': 'AUTO_INVEST_PLAN_INTERESTFEE', 'name': '薪计划利息管理费'},
  '56': {'code': 'CHANNEL_RECHARGE_DIFF_SUPPLEMENT', 'name': '还款差额补足'},
  '57': {'code': 'CHANNEL_REPAY_RECHARGE', 'name': '渠道还款充值'},
  '58': {'code': 'YX_CHANNEL_PAY_FEE', 'name': '至信渠道支付服务费'},
  '59': {'code': 'AS_CHANNEL_PAY_FEE', 'name': '安盛渠道支付服务费'},
  '60': {'code': 'ZDSD_CHANNEL_PAY_FEE', 'name': '证大速贷渠道支付服务费'},
  '61': {'code': 'ZAXY_CHANNEL_PAY_FEE', 'name': '中安信业渠道支付服务费'},
  '62': {'code': 'AMQUE_RECHARGE', 'name': '贷后申请充值'},
  '63': {'code': 'AMQUE_REPAY', 'name': '贷后申请还款'},
  '64': {'code': 'RECHARGE_FEE', 'name': '充值手续费'},
  '65': {'code': 'REPAY_LENDERS_TOTAL_FREEZE', 'name': '冻结给理财人的还款总额'},
  '66': {'code': 'REPAY_LENDERS_TOTAL_UNFREEZE', 'name': '解冻给理财人的还款总额'},
  '67': {'code': 'TRANSFER_FREEZE', 'name': '转账金额冻结'},
  '68': {'code': 'TRANSFER_UNFREEZE', 'name': '转账金额解冻'},
  '69': {'code': 'TRANSFER_ACCOUNT', 'name': '账户转账'},
  '70': {'code': 'RECHARGE_FREEZE', 'name': '充值且冻结'},
  '71': {'code': 'HEIKA_CASH_DRAW', 'name': '黑卡用户提现'},
  '72': {'code': 'HXB_CASH_DRAW', 'name': '红小宝标的放款'},
  '73': {'code': 'YX_CHANNEL_REPAY_DIFFERENCE', 'name': '至信还款差额补足'},
  '74': {'code': 'START_LOAN_COUPON_TRANSFER_FREEZE', 'name': '放标优惠券对应帐户转帐到借款人冻结'},
  '75': {'code': 'REPAY_GUARANTEE_TOTAL_UNFREEZE', 'name': '解冻给保障金的还款总额'},
  '76': {'code': 'REPAY_BALANCE_TOTAL_UNFREEZE', 'name': '解冻给平衡金的还款总额'},
  '77': {'code': 'REPAY_HXB_TOTAL_UNFREEZE', 'name': '解冻给红小宝人的还款总额'},
  '78': {'code': 'BALANCE_DIFF_TO_BORROWER', 'name': '平衡金补足老标还款差额'},
  '79': {'code': 'FREEZE_BALANCE_DIFF_TO_BORROWER', 'name': '冻结平衡金补足老标还款差额'},
  '80': {'code': 'TRANSFER_BORROWER_TO_HXB_FOR_BALANCE', 'name': '红小宝代收平衡金差额'},
  '81': {'code': 'INTEREST_SETTLE', 'name': '存管托管账户结息'},
  '82': {'code': 'BANLANCE_COLLECTION', 'name': '平衡金收入'},
  '83': {'code': 'CHANNEL_RECHARGE_UNFREEZE', 'name': '渠道充值解冻'},
  '84': {'code': 'AMQUE_RECHARGE_UNFREEZE', 'name': '贷后充值解冻'},
  '85': {'code': 'CHANNEL_RECHARGE_FREEZE', 'name': '渠道充值冻结'},
  '86': {'code': 'START_LOAN_TRANSFER_FREEZE', 'name': '放标转帐冻结'},
  '87': {'code': 'PLATFORM_CASH_DRAW', 'name': '平台提现'},
  '88': {'code': 'CASH_DRAW_FEE_REFUND', 'name': '提现手续费退款'},
  '89': {'code': 'BATCH_MANUAL_RECHARGE', 'name': '人工批量充值'},
  '90': {'code': 'BATCH_SEND_BONUS', 'name': '活动奖励'},
  '91': {'code': 'LOAN_TRANSFER_FREEZE', 'name': '购买债权冻结'},
  '92': {'code': 'LOAN_TRANSFER_UNFREEZE', 'name': '购买债权解冻'},
  '93': {'code': 'LOAN_TRANSFER_FAIL_UNFREEZE', 'name': '存管失败解冻'},
  '94': {'code': 'AUTOINVESTPLAN_CASHDRAW', 'name': '薪计划回款'},
  '95': {'code': 'AUTO_INVEST_PLAN_OVERDUE_FEE', 'name': '薪计划逾期管理费'},
  '96': {'code': 'AUTO_INVEST_PLAN_OVERDUE_HOOMSUN', 'name': '薪计划逾期管理费_红小宝'},
  '97': {'code': 'CHG_MOBILE_PLATFORM', 'name': '平台发起手机号修改'},
  '98': {'code': 'PXD_CASH_DRAW', 'name': '培训贷标的放款'},
  '99': {'code': 'FEE_TRANS', 'name': '费用结转'},
  '100': {'code': 'NEWFINANCEPLAN_CASHDRAW', 'name': '月升计划回款'},
  '101': {'code': 'REGISTER_FINANCE_PLAN_NEW', 'name': '加入月升计划'},
  '102': {'code': 'NEWPLAN_SERVICE_FEE_4_HOOMSUN', 'name': '月升计划服务费'},
  '103': {'code': 'NEWPLAN_QUIT_ADVANCE_FEE', 'name': '月升计划提前退出费用'},
  '104': {'code': 'NEWPLAN_QUIT_ADVANCE_FEE_4_HOOMSUN', 'name': '月升计划提前退出费用_红小宝'},
};
// 批量还款 批次状态
exports.REPAY_BATCH_STATUS = {
  'UNPROCESS': '未操作',
  'PROCESSING': '处理中',
  'RECHARGE_FAILURE': '充值失败',
  'REPAY_FAILURE': '还款失败',
  'REPAY_FAILURE_INSUFFICIENT_AMOUNT': '余额不足',
  'REPAY_SUCCESS': '还款成功',
  'WAIT_AUDIT': '等待审批',
  'AUDIT_PASS': '审批通过',
  'AUDIT_REJECT': '审批驳回',
  'CANCEL': '撤销',
};
// 批量还款 批次充值状态
exports.REPAY_BATCH_RECHARGE_STATUS = {
  'UNPROCESS': '未处理',
  'PROCESSING': '处理中',
  'VALID_FAILURE': '验证失败',
  'SUCCESS': '成功',
  'FAILURE': '失败',
  'ORDER_FAIL': '订单失败',
  'PART_SUCCESS': '部分成功',
};
//散标协议投标来源状态
exports.LOAN_AGREEMENT_SOURCE_TYPE = {
  'NORMAL_BID': '主动投标',
  'FINANCEPLAN_BID': '红利智投投标'
};
exports.TRANSFER_TYPE = {
  'TRANSFERING': '转让中',
  'TRANSFERED': '已完成',
  'CANCLE': '已取消',
  'CLOSED_CANCLE': '结标取消',
  'OVERDUE_CANCLE': '逾期取消',
  'PRESALE': '转让预售'
};
//优惠券类型
exports.COUPON_TYPE = {
  'DISCOUNT': '抵扣券',
  'MONEY_OFF': '满减券'
};
//优惠券状态
exports.COUPON_STATE = {
  'AVAILABLE': '可使用',
  'USED': '已使用',
  'DISABLED': '已失效'
};
//产品适用人群
exports.APPLY_PEOPLE_TYPE = {
  'CONSERVATIVE': '保守型',
  'PRUDENT': '稳健型',
  'PROACTIVE': '积极应对型'
};
// 标的状态
exports.parseLoanStatus = function(id){
  return find(id, exports.LOAN_STATUS);
};
// 还款类型
exports.parseLoanType = function(id){
  return exports.LOAN_TYPE[id];
};
// 还款方式
exports.parseLoanRepaidType = function(id){
  return exports.LOAN_REPAID_TYPE[id];
};
//婚姻状态
exports.parseLoanDetailMarriageStauts = function(id){
  return exports.LOAN_DETAIL_MARRIAGE_STATUS[id];
};
// 投标方式
exports.parseLoanLenderType = function(id){
  return exports.LOAN_LENDER_TYPE[id];
};
// 计划状态
exports.parsePlanStatus = function(id){
  return exports.PLAN_STATUS[id+''];
};
// 计划子账户状态
exports.parsePlanSubAccountStatus = function(id){
  return exports.PLAN_SUB_ACCOUNT_STATUS[id];
};
// 计划子账户状态
exports.parsePlanCashType = function(id){
  return exports.PLAN_CASH_TYPE[id];
};
exports.parsePlanCashTypeApp = function(id){
  return exports.PLAN_CASH_TYPE_APP[id];
};
// 计划子账户交易记录子类型
exports.parsePlanFundSubType = function(id){
  return exports.PLAN_FUND_SUB_TYPE[id];
};
// 交易记录父类型
exports.parseFundParentType = function(id){
  return find(id, exports.FUND_PARENT_TYPE);
};
// 交易记录子类型
exports.parseFundSubType = function(id){
  return find(id, exports.FUND_SUB_TYPE);
};
// 批量还款 批次状态
exports.parseRepayBatchStatus = function(id){
  return exports.REPAY_BATCH_STATUS[id];
};
// 批量还款 批次充值状态
exports.parseRepayBatchRechargeStatus = function(id){
  return exports.REPAY_BATCH_RECHARGE_STATUS[id];
};
// 散标协议投标来源状态
exports.parseLoanAgreementSourceStatus = function(id){
  return exports.LOAN_AGREEMENT_SOURCE_TYPE[id];
};
//计划、散标购买确认状态
exports.parseProductBuyStatus = function(id){
  return find(id, exports.ERROR_CODE);
};
//婚姻状态
exports.parseTransferText = function(id){
  return exports.TRANSFER_TYPE[id];
};
//优惠券类型
exports.parseCouponType = function(id){
  return find(id, exports.COUPON_TYPE);
};
//优惠券状态
exports.parseCouponState = function(id){
  return find(id, exports.COUPON_STATE);
};
//产品适用人群
exports.parseApplyPeople = function(id){
  return find(id, exports.APPLY_PEOPLE_TYPE);
};
function find(id, dict) {
  return dict[id] || _.find(dict, {code:id});
}


