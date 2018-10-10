
'use strict';

/**
 * service
 */
module.exports = (app) => {
  const service = app.context.service = {};
  service.account = require('./account.js');
  service.coupon = require('./coupon.js');
  service.invite = require('./invite.js');
  service.loan = require('./loan.js');
  service.plan = require('./plan.js');
  service.user = require('./user.js');
  service.bank = require('./bank.js');
  // use cache
  //service.splash = require('./splash.js');
  service.withdraw = require('./withdraw.js');
  service.about = require('./about.js');
  service.enterprise = require('./enterprise.js');
  service.landing = require('./landing.js');
  return app;
};
