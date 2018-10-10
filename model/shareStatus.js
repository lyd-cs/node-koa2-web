'use strict';

/**
 * share Status
 */
// const { _ } = require('../lib/util');
// const shareModel = require('./share');

function shareStatus(model = {}) {
  // share status `disabled|none|link|picture`
  // http://doc.hoomxb.com/index.php?s=/2&page_id=249

  // 调试
  // model.shareStatus = _.sample(['none', 'link', 'picture']);
  // model.share = shareModel(
  //   {
  //     status: 'none', //'none', 'link', 'picture'
  //     title: '分享标题',
  //     desc: '分享描述',
  //     link: '/',
  //     wechat: '/',
  //     moments: '/',
  //     qq: '/',
  //     qzone: '/',
  //     image: 'https://picsum.photos/300/300/?random'
  //   },
  //   extra
  // );

  // 没有分享
  model.share = { status: 'none' };
  //model.share = shareModel(model.share, extra);
  return model;
}

// exports splash
module.exports = shareStatus;
