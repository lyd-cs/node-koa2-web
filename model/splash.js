'use strict';

/**
 * splash model
 */
const { formatURL } = require('../lib/util');

function spalsh(model = {}, extra = {}) {
  const { host } = extra;
  if (!model.url) {
    model.url = '';
  }
  if (!model.link) {
    // url 是 link
    model.link = model.url;
  }
  // absolute image url
  if (model.image) {
    model.image = formatURL(model.image, host);
    // url 改成 image,老版本使用url作为图片地址
    model.url = model.image;
  }
  return model;
}

spalsh.availableSplash = sholdCheckDisabled => {
  return function(ele) {
    // 被禁用
    if (!!sholdCheckDisabled && !!ele.disabled) {
      return;
    }
    const now = Date.now();
    const start = ele.start - 0 || 0;
    const end = ele.end - 0 || 0;
    // 在有效期
    if (start < now && (!end || now < end)) {
      return true;
    }
  };
};

// exports splash
module.exports = spalsh;
