'use strict';

/**
 * share
 */
const Model = require('../model/share');

module.exports = (userId, action) => {
  const DEFAULT_SHARE_ACTION = 'def';
  const SHARE_CUSTOMER_INVITE_LINK = `/landing/invite/register/${userId}`;
  const SHARE_SALES_INVITE_LINK = `/landing/about/${userId}?utmSource=Group4-SalesH5`;

  const SHARE_DATA = {
    'def': {
      'title': '帮我拆开这个红包，礼金分你一半',
      'desc': '我在红小宝投资收益还不错，邀请你来体验，拆开红包，千元礼金和我平分',
      'link': '/',
      'wechat': '/',
      'moments': '/',
      'qq': '/',
      'qzone': '/',
      'image': 'https://picsum.photos/300/300/?random'
    },
    'customerInvite': {
      'title': '帮我拆开这个红包，礼金分你一半',
      'desc': '我在红小宝投资收益还不错，邀请你来体验，拆开红包，千元礼金和我平分',
      'link': SHARE_CUSTOMER_INVITE_LINK,
      'wechat': `${SHARE_CUSTOMER_INVITE_LINK}?utmSource=App-1001`,
      'moments': `${SHARE_CUSTOMER_INVITE_LINK}?utmSource=App-1002`,
      'qq': `${SHARE_CUSTOMER_INVITE_LINK}?utmSource=App-1003`,
      'qzone': `${SHARE_CUSTOMER_INVITE_LINK}?utmSource=App-1004`,
      'image': '/img/mobile/invite-logo.png'
    },
    'salesInvite': {
      'title': '红小宝2.0新版起航，邀您体验',
      'desc': '红小宝携手恒丰银行完成资金存管，2.0版本扬帆起航，一分钟探索新版红小宝',
      'link': SHARE_SALES_INVITE_LINK,
      'wechat': SHARE_SALES_INVITE_LINK,
      'moments': SHARE_SALES_INVITE_LINK,
      'qq': SHARE_SALES_INVITE_LINK,
      'qzone': SHARE_SALES_INVITE_LINK,
      'image': '/img/mobile/logo-wx.jpg'
    }
  };

  if(!action || !SHARE_DATA[action]){
    action = DEFAULT_SHARE_ACTION;
  }

  return Model(SHARE_DATA[action]);
};
