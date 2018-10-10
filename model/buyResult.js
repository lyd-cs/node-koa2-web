'use strict';

/**
 * buy result model
 **/
const INVITE_ACTIVITY_ENABLED = true;
const INVITE_ACTIVITY_SLOGAN = '邀请好友分1000元红包';

// exports
module.exports = (model = {}, extra = {}) => {
  // 购买成功活动提示
  model.isInviteActivityShow = INVITE_ACTIVITY_ENABLED;
  model.inviteActivityDesc = INVITE_ACTIVITY_SLOGAN;

  // 禁用购买活动提示
  if (extra && extra.disableActivity) {
    model.isInviteActivityShow = false;
  }

  return model;
};
