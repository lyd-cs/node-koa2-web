'use strict';

/**
 * transfer model
 */

const STATUS = {
  // 计划退出中 的债权状态
  IN_TRANFER: '转让中',
  OVER_TRANFER: '已转让',
  // 计划已退出 的债权状态
  FINISH_TRANFER: '已转让',
  // 计划持有中 的债权状态
  IN_PROGRESS: '收益中',
  CLOSED: '已结清',
  // 债转状态 正在转让
  // http://doc.hoomxb.com/index.php?s=/1&page_id=221
  TRANSFERING: '转让中',
  // 债转状态 转让完毕
  TRANSFERED: '已完成',
  // 债转状态 已取消
  CANCLE: '已取消',
  // 债转状态 结标取消
  CLOSED_CANCLE: '结标取消',
  // 债转状态 逾期取消
  // 'OVERDUE_CANCLE': '逾期取消',
  // 债转状态 转让预售
  PRESALE: '转让预售'
};
const UNMATCH_TEXT = '';

// find key in object
function find(obj, key) {
  return (key && obj[key]) || UNMATCH_TEXT;
}

// exports
module.exports = (model = {}) => {
  // 债转状态文本
  model.statusText = find(STATUS, model.status);
  return model;
};
