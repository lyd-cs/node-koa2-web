'use strict';

/**
 * share
 */
const ShareModel = require('../model/share');

module.exports = async ctx => {
  const homeCache = ctx.cache.home;

  const { userId } = ctx.args;

  let action = ctx.checkBody('action').value;
  let ret;

  const DEFAULT_SHARE_ACTION = 'def';
  const SHARE_BUY_LINK = `/landing/invite/register/${userId}`;
  const SHARE_DATA = {
    def: {
      title: '帮我拆开这个红包，礼金分你一半',
      desc:
        '我在红小宝投资收益还不错，邀请你来体验，拆开红包，千元礼金和我平分',
      link: '/',
      wechat: '/',
      moments: '/',
      qq: '/',
      qzone: '/',
      image: 'https://picsum.photos/300/300/?random'
    },
    buy: {
      title: '帮我拆开这个红包，礼金分你一半',
      desc:
        '我在红小宝投资收益还不错，邀请你来体验，拆开红包，千元礼金和我平分',
      link: SHARE_BUY_LINK,
      wechat: `${SHARE_BUY_LINK}?utmSource=App-1001`,
      moments: `${SHARE_BUY_LINK}?utmSource=App-1002`,
      qq: `${SHARE_BUY_LINK}?utmSource=App-1003`,
      qzone: `${SHARE_BUY_LINK}?utmSource=App-1004`,
      image: '/img/mobile/invite-logo.png'
    }
  };

  if (!action || !SHARE_DATA[action]) {
    action = DEFAULT_SHARE_ACTION;
  }
  let host;
  try {
    const { h5host } = await homeCache.get_app_info();
    host = h5host;
  } catch (error) {}

  ret = ShareModel(SHARE_DATA[action], { host: host });

  ctx.dumpJSON(ret);
};
