'use strict';

/**
 * assets model
 */
function sum(num1, num2) {
  let len1, len2, maxLen;

  len1 = (num1.toString().split('.')[1] || '').length;
  len2 = (num2.toString().split('.')[1] || '').length;
  maxLen = Math.pow(10, Math.max(len1, len2, 2));
  return (num1 * maxLen + num2 * maxLen) / maxLen;
}

// exports
module.exports = (model = {}) => {
  // 负资产不显示
  ['assetsTotal', 'financePlanAssets', 'lenderPrincipal'].forEach(key => {
    let val = model[key] - 0 || 0;
    if (val < 0) {
      val = 0;
    }
    model[key] = val;
  });
  // 添加持有总资产字段（红利计划持有+散标债券持有）
  model.holdingTotalAssets = sum(
    model.financePlanAssets,
    model.lenderPrincipal
  );
  return model;
};
