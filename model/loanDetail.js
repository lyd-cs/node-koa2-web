'use strict';

/**
 * loan model
 */
const { loanDetailDescription } = require('../lib/util');
const ErrMsg = require('../lib/errormsg');

function CertificationSortModel(model = '') {
  const defaultOrder = [
    'IDENTIFICATION_SCANNING',
    'WORK',
    'INCOME_DUTY',
    'CREDIT'
  ];
  let certification = new Set(model.split(',').map(item => item.trim()));

  const middleArray = defaultOrder.filter(
    item => certification.has(item) && certification.delete(item)
  );
  return [...middleArray, ...certification].toString();
}

function CountDefaultValue(value = '') {
  return value ? `${value}次` : '0次';
}

function StatusDefaultValue(value = '', key = '') {
  const config = {
    protectSolution: '暂无',
    userFinanceStatus: '良好',
    repaymentCapacity: '暂无变化',
    punishedStatus: '暂无信息',
    otherMajorLiabilities: '无'
  };
  return value ? `${value}` : config[key];
}

// exports
module.exports = (model = {}) => {
  const riskLevelDesc = ErrMsg.loanDetailSecurityLevel;
  let { loanVo, cashDraw, idCardInfo, userVo } = model;
  const { creditInfoItems, amount, title } = loanVo;
  const { age, gender } = idCardInfo;
  const {
    companyProvince,
    companyLocation,
    companyPost,
    overDueStatus,
    otherPlatStatus,
    protectSolution,
    userFinanceStatus,
    repaymentCapacity,
    punishedStatus,
    otherMajorLiabilities
  } = userVo;
  const info = {
    amount,
    title,
    age,
    gender,
    companyProvince,
    companyLocation,
    companyPost
  };
  loanVo = {
    ...loanVo,
    riskLevelDesc,
    creditInfoItems: CertificationSortModel(creditInfoItems)
  };
  userVo = {
    ...userVo,
    cashDrawStatus: cashDraw ? '恒丰银行已受理提现' : '恒丰银行暂未受理提现',
    description: loanDetailDescription(info),
    overDueStatus: CountDefaultValue(overDueStatus),
    otherPlatStatus: CountDefaultValue(otherPlatStatus),
    protectSolution: StatusDefaultValue(protectSolution, 'protectSolution'),
    userFinanceStatus: StatusDefaultValue(
      userFinanceStatus,
      'userFinanceStatus'
    ),
    repaymentCapacity: StatusDefaultValue(
      repaymentCapacity,
      'repaymentCapacity'
    ),
    punishedStatus: StatusDefaultValue(punishedStatus, 'punishedStatus'),
    otherMajorLiabilities: StatusDefaultValue(
      otherMajorLiabilities,
      'otherMajorLiabilities'
    )
  };
  model = {
    ...model,
    loanVo,
    userVo
  };
  return model;
};
