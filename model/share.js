'use strict';

/**
 * share model
 */
const { formatURL } = require('../lib/util');

function share(model = {}, extra = {}) {
  const { host } = extra;
  // absolute image url
  if (model.image) {
    model.image = formatURL(model.image, host);
  }
  return model;
}

// exports splash
module.exports = share;
