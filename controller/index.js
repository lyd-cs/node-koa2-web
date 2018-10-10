/**
 * routers
 */
const Router = require('koa-router');
//const limit = require('./limit');
const home = require('./home');
const about = require('./about');
const user = require('./user');
const account = require('./account');
const accountList = require('./account.list');
const accountSetting = require('./account.setting');
const loan = require('./loan');
const tpl = require('./template');
const plan = require('./plan');
const cache = require('./cache');
const apiServer = require('../server');
const error = require('./error');
const mobile = require('../mobile');
const enterprise = require('./enterprise');
const landing = require('./landing');
const novice = require('./novice');
/**
 * web router
 */
function webRouter() {
  const router = new Router();
  router
    //api
    .get('/api/heartbeat', account.heartBeat)
    .get('/api/plan', plan.ajaxList, tpl.jsonHtml('./mod/plan.list.page.pug'))
    .post(
      '/api/account/invite',
      user.loginRequired,
      account.inviteAjaxList,
      tpl.jsonHtml('./mod/account.invite.list.pug')
    )
    .post('/api/send/smscode', user.sendVerifyCode)
    .post('/api/guide', about.guideGetRate)
    .post('/api/checkMobile', user.checkMobile)
    .post('/api/checkExistMobile', user.checkExistMobile)
    .post('/api/checkCaptcha', user.verifyCaptcha, user.checkCaptcha)
    .post('/api/verifycode/send', user.verifyCaptcha, user.sendVerifyCode)
    .post(
      '/api/account/loan/list',
      user.loginRequired,
      accountList.loan,
      tpl.jsonHtml('./mod/account.loan.list.pug')
    )
    .post(
      '/api/loan/investRecord',
      loan.postInvestRecord,
      tpl.jsonHtml('./mod/loan.detail.record.pug')
    )
    .post(
      '/api/loan/refundPlan',
      loan.postRefundPlan,
      tpl.jsonHtml('./mod/loan.detail.plan.pug')
    )
    .post(
      '/api/account/plan/list',
      user.loginRequired,
      accountList.plan,
      tpl.jsonHtml('./mod/account.plan.list.pug')
    )
    .post('/api/account/message/read', user.loginRequired, account.message)
    .post('/api/account/riskvail', user.loginRequired, accountSetting.riskvail)
    .post(
      '/api/plan/joinRecord',
      plan.detailJoinRecord,
      tpl.jsonHtml('./mod/plan.detail.joinRecord.pug')
    )
    .post('/api/riskGuard', user.loginRequired, user.postGuardScore)
    .post(
      '/api/loan/debt',
      loan.debtList,
      tpl.jsonHtml('./mod/transfer.debt.list.pug')
    )
    .post(
      '/api/loan/transfer',
      loan.transferList,
      tpl.jsonHtml('./mod/transfer.order.list.pug')
    )
    .post(
      '/api/loan/list/dropdown',
      account.loanListDropdown,
      tpl.jsonHtml('./mod/account.list.dropdown.pug')
    )
    .post(
      '/api/plan/list/dropdown',
      account.planListDropdown,
      tpl.jsonHtml('./mod/account.list.dropdown.pug')
    )
    .post('/api/smscode/:action', user.loginRequired, account.amountSmscode)
    .post(
      '/api/loan/buy',
      user.loginRequired,
      loan.buyBack,
      tpl.jsonHtml('loan.buy.result.pug')
    )
    .post(
      '/api/transfer/buy',
      user.loginRequired,
      loan.transferResult,
      tpl.jsonHtml('loan.buy.result.pug')
    )
    .post(
      '/api/plan/buy',
      user.loginRequired,
      plan.buyResult,
      tpl.jsonHtml('plan.buy.result.pug')
    )
    .post(
      '/api/account/createaccount',
      user.loginRequired,
      user.createAccountPost,
      tpl.jsonHtml('user.depository.account.result.pug')
    )
    .post('/api/bankcard/checked', user.loginRequired, user.bankCardChecked)
    .post(
      '/api/plan/couponList',
      user.loginRequired,
      plan.couponList,
      tpl.jsonHtml('./mod/product.coupon.list.pug')
    )
    .post('/api/signup', user.signupPost)
    .post('/api/plan/exit/cancle', user.loginRequired, account.planExitCancle)
    .post('/api/plan/exit/confirm', user.loginRequired, account.planExitConfirm)

    //coupon
    .post(
      '/api/couponList',
      user.loginRequired,
      account.couponList,
      tpl.jsonHtml('./mod/account.coupon.list.pug')
    )
    // .post('/api/exchangeCoupon', user.loginRequired, account.couponExchange, tpl.jsonHtml('../src/js/tpl/coupon.exchange.success.pug'))
    .post('/api/exchangeCoupon', user.loginRequired, account.couponExchange)
    .post('/api/choose/coupon', user.loginRequired, plan.couponChoose)
    //signup
    // .post('/signup', user.loginCheck, user.signupPost, tpl.html('user.login.signup.pug'))
    // .post('/deposit/createaccount', user.loginRequired, user.createAccount, tpl.html('user.depository.account.pug'))
    .post(
      '/signup/name',
      user.loginRequired,
      user.signupRealname,
      tpl.html('user.login.signup.pug')
    )
    .post(
      '/login',
      user.loginCheck,
      user.loginPost,
      tpl.html('user.login.signup.pug')
    )
    .post('/forgot', user.forgot, tpl.html('user.forgot.step1.pug'))
    .post('/api/checkIdentityAuth', user.checkIdentity)
    //loan product
    .get('/loan', loan.list, tpl.html('loan.list.pug'))
    .get('/loan/:id', loan.detail, tpl.html('loan.detail.pug'))
    .post(
      '/loan/:id',
      user.loginRequired,
      loan.buyConfirm,
      tpl.html('loan.buy.confirm.pug')
    )
    .post(
      '/loan/:id/result',
      user.loginRequired,
      loan.buyResult,
      tpl.html('loan.buy.pug')
    )
    //.get('/loan/:id/success', user.loginRequired, tpl.html('loan.buy.result.success.pug'))
    //plan product
    .get('/plan', plan.list, tpl.html('plan.list.pug'))
    .get('/plan/:id', plan.detail, tpl.html('plan.detail.pug'))
    .post(
      '/plan/:id',
      user.loginRequired,
      plan.buyConfirm,
      tpl.html('plan.buy.confirm.pug')
    )
    .post(
      '/plan/:id/result',
      user.loginRequired,
      plan.postResult,
      tpl.html('plan.buy.pug')
    )
    .get('/plan/invest/list', plan.investList, tpl.html('plan.invest.list'))
    //.get('/plan/:id/success', user.loginRequired, tpl.html('plan.buy.result.success.pug'))
    // transfer product
    .get('/transfer', loan.transfer, tpl.html('loan.transfer.pug'))
    .get(
      '/transfer/:id',
      loan.transferDetail,
      tpl.html('loan.transfer.detail.pug')
    )
    .post(
      '/transfer/:id',
      user.loginRequired,
      loan.transferConfirm,
      tpl.html('loan.transfer.confirm.pug')
    )
    .post(
      '/transfer/:id/result',
      user.loginRequired,
      loan.transferBack,
      tpl.html('loan.buy.pug')
    )
    //.get('/transfer/:id/success', user.loginRequired, tpl.html('loan.buy.result.success.pug'))
    //landing
    .get('/landing/invite', tpl.html('landing.invite.pug'))
    .get(
      '/landing/invite/:id',
      user.loginCheck,
      user.signup,
      tpl.html('landing.signup.pug')
    )
    .get('/landing/funddeposit', tpl.html('landing.fund.deposit.pug'))
    .get(
      '/landing/highpoint',
      mobile.landing.highPoint,
      tpl.html('landing.highpoint.pug')
    )
    .get(
      '/landing/financing',
      mobile.landing.highPoint,
      tpl.html('landing.financing.pug')
    )
    .get(
      '/landing/jd/redpacket',
      user.loginRequired,
      user.redpacket,
      tpl.html('landing.jd.redpacket.pug')
    )
    .get(
      '/landing/jd/signup',
      user.loginCheck,
      user.jdActiveSignup,
      tpl.html('landing.jd.signup.pug')
    )
    .get(
      '/landing/ordinary',
      user.loginCheck,
      user.signup,
      tpl.html('landing.ordinary.signup.pug')
    )
    .get(
      '/landing/duanwu',
      landing.duanwu,
      tpl.html('landing.duanwu.pug')
    )
    // .post('/landing/invite/:id', user.loginCheck, user.signupPost, tpl.html('landing.signup.pug'))
    .get('/landing/novice', novice,  tpl.html('landing.novice.pug'))
    //user
    .get(
      '/signup',
      user.loginCheck,
      user.signup,
      tpl.html('user.login.signup.pug')
    )
    .get(
      '/signup/name',
      user.loginRequired,
      tpl.html('user.signup.realname.pug')
    )
    .get(
      '/signup/name/result',
      user.loginRequired,
      tpl.html('user.signup.realname.result.pug')
    )
    .get(
      '/login',
      user.loginCheck,
      user.login,
      tpl.html('user.login.signup.pug')
    )
    .get('/forgot', user.forgot, tpl.html('user.forgot.step1.pug'))
    .get(
      '/deposit/createaccount',
      user.loginRequired,
      user.createAccount,
      tpl.html('user.depository.account.pug')
    )
    // .get('/deposit/createaccount', user.loginRequired, user.createAccount, tpl.html('user.depository.account.pug'))
    //about
    .get(
      '/about/announcement',
      about.announcement,
      tpl.html('about.announcement.pug')
    )
    // report
    .get('/about/report/2016', tpl.html('about.report.2016.pug'))
    .get('/about/report/2017', tpl.html('about.report.2017.pug'))
    .get('/about/report/2018Q1', tpl.html('about.report.2018Q1.pug'))
    .get(
      '/about/announcement/:id',
      about.announcementDetail,
      tpl.html('about.announcement.detail.pug')
    )
    .get('/about/:action', about.navs)
    .get('/guide', tpl.html('guide.pug'))
    .get('/wscredit', tpl.html('wscredit.pug'))
    .get('/help', about.helpBankLimit, tpl.html('help.pug'))
    .get('/help/list', tpl.html('help.list.pug'))
    .get('/help/list/:id', about.helpList, tpl.html('help.list.detail.pug'))
    .get(
      '/agreement/:action',
      about.agreement,
      tpl.html('user.signup.agreement.pug')
    )
    // verifyimage
    .get('/captcha', user.captcha)
    //account
    .get(
      '/account/invite',
      user.loginRequired,
      account.invite,
      tpl.html('account.invite.pug')
    )
    .get('/qrcode/:action/:id', user.qrcode)
    .post(
      '/account/secure',
      user.loginRequired,
      accountSetting.secure,
      tpl.html('account.secure.pug')
    )
    .post(
      '/account/password',
      user.loginRequired,
      accountSetting.password,
      tpl.html('account.password.pug')
    )
    .post(
      '/account/mobile',
      user.loginRequired,
      accountSetting.mobile,
      tpl.html('account.mobile.pug')
    )
    .post(
      '/account/trad/password',
      user.loginRequired,
      user.identityAuth,
      accountSetting.tradPassword,
      tpl.html('account.trad.password.pug')
    )
    .post(
      '/account/withdraw',
      user.loginRequired,
      user.identityAuth,
      account.withdraw,
      tpl.html('account.withdraw.pug')
    )
    .post(
      '/account/charge',
      user.loginRequired,
      user.checkEscrowAccount,
      account.charge,
      tpl.html('account.charge.pug')
    )
    .get(
      '/account/riskvail',
      user.loginRequired,
      accountSetting.lastPageUrl,
      tpl.html('account.riskvail.pug')
    )
    .get(
      '/account/transfer/result/:id/success',
      user.loginRequired,
      tpl.html('account.transfer.result.success.pug')
    )
    .get(
      '/account/transfer/:id',
      user.loginRequired,
      account.transferAffirm,
      tpl.html('account.transfer.pug')
    )
    .post(
      '/account/transfer/:id',
      user.loginRequired,
      account.transferAffirm,
      tpl.html('account.transfer.pug')
    )
    .get(
      '/account/quickpay/result',
      user.loginRequired,
      tpl.html('account.quickpay.result.pug')
    )
    //.get('/landing/newedition', tpl.html('landing.newedition.pug'))
    .get('/landing/depository', tpl.html('landing.depository.pug'))
    .get(
      '/account',
      user.loginRequired,
      account.home,
      tpl.html('account.home.pug')
    )
    .get(
      '/account/plan',
      user.loginRequired,
      accountList.plan,
      tpl.html('account.plan.list.pug')
    )
    .get(
      '/account/plan/:id',
      user.loginRequired,
      account.planDetail,
      tpl.html('account.plan.detail.pug')
    )
    //.get('/account/plan/:id/agreement', user.loginRequired, account.planAgreement, tpl.html('manual.plan.agree.pug'))
    //.get('/account/loan/:id/agreement', user.loginRequired, account.loanAgreement, tpl.html('manual.loan.agree.pug'))
    .get(
      '/account/plan/:id/agreement',
      user.loginRequired,
      account.planAgreement
    )
    .get(
      '/account/loan/:id/agreement',
      user.loginRequired,
      account.loanAgreement
    )
    .get(
      '/account/transfer/:id/agreement',
      user.loginRequired,
      account.transferAgreement
    )
    .get(
      '/account/loan',
      user.loginRequired,
      accountList.loan,
      tpl.html('account.loan.list.pug')
    )
    //coupon
    .get(
      '/account/coupon',
      user.loginRequired,
      account.couponList,
      tpl.html('account.coupon.pug')
    )
    .get(
      '/account/message',
      user.loginRequired,
      account.message,
      tpl.html('account.message.pug')
    )
    .get(
      '/account/setting',
      user.loginRequired,
      accountSetting.home,
      tpl.html('account.setting.pug')
    )
    .get(
      '/account/unbind',
      user.loginRequired,
      account.unbindBankCard,
      tpl.html('account.unbind.pug')
    )
    .post(
      '/account/unbind',
      user.loginRequired,
      account.unbindBankCard,
      tpl.html('account.unbind.pug')
    )
    .get(
      '/account/secure',
      user.loginRequired,
      accountSetting.secure,
      tpl.html('account.secure.pug')
    )
    .get(
      '/account/mobile',
      user.loginRequired,
      accountSetting.mobile,
      tpl.html('account.mobile.pug')
    )
    .get(
      '/account/password',
      user.loginRequired,
      accountSetting.password,
      tpl.html('account.password.pug')
    )
    .get(
      '/account/invite/code',
      user.loginRequired,
      accountSetting.inviteCode,
      tpl.html('account.invite.code.pug')
    )
    .post(
      '/account/invite/code',
      user.loginRequired,
      accountSetting.inviteCode,
      tpl.html('account.invite.code.pug')
    )
    .post(
      '/account/invite/code/result',
      user.loginRequired,
      accountSetting.inviteCode,
      tpl.html('account.invite.code.result.pug')
    )
    .get(
      '/account/trad/password',
      user.loginRequired,
      accountSetting.tradPassword,
      tpl.html('account.trad.password.pug')
    )
    .get(
      '/account/tradlist',
      user.loginRequired,
      accountList.tradList,
      tpl.html('account.trad.list.pug')
    )
    .get(
      '/account/withdraw',
      user.loginRequired,
      user.identityAuth,
      account.withdraw,
      tpl.html('account.withdraw.pug')
    )
    .get(
      '/account/withdraw/list',
      user.loginRequired,
      account.withdrawList,
      tpl.html('account.withdraw.list.pug')
    )
    .get(
      '/account/charge',
      user.loginRequired,
      user.checkEscrowAccount,
      account.charge,
      tpl.html('account.charge.pug')
    )
    //.get('/account/transfer/:id/agreement', user.loginRequired, account.transferAgreement, tpl.html('manual.transfer.agree.pug'))
    //.get('/account/quickpay', user.loginRequired, user.identityAuth, account.quickpay, tpl.html('account.quickpay.pug'))
    .get(
      '/account/quickpay',
      user.loginRequired,
      user.checkEscrowAccount,
      account.quickpay,
      tpl.html('account.quickpay.pug')
    )
    .post(
      '/account/quickpay',
      user.loginRequired,
      user.checkEscrowAccount,
      account.quickpay,
      tpl.html('account.quickpay.pug')
    )
    .get(
      '/account/charge/result',
      user.loginRequired,
      account.chargeResult,
      tpl.html('account.charge.result.pug')
    )
    .get(
      '/account/bank/add',
      user.loginRequired,
      account.bankAdd,
      tpl.html('account.bank.add.pug')
    )
    .post(
      '/account/bank/add',
      user.loginRequired,
      account.bankAdd,
      tpl.html('account.bank.add.pug')
    )
    .post(
      '/account/bank/add/result',
      user.loginRequired,
      account.bankAdd,
      tpl.html('account.bank.add.result.pug')
    )
    .get(
      '/account/plan/:id/exit',
      user.loginRequired,
      account.planExit,
      tpl.html('account.plan.exit.pug')
    )
    .post(
      '/account/plan/:id/exit',
      user.loginRequired,
      account.planExit,
      tpl.html('account.plan.exit.pug')
    )
    .get(
      '/account/plan/join/:id/exit',
      user.loginRequired,
      account.planJoinExit,
      tpl.html('account.plan.join.exit.pug')
    )
    .post(
      '/account/plan/join/:id/exit',
      user.loginRequired,
      account.planJoinExit,
      tpl.html('account.plan.join.exit.pug')
    )
    // error
    .get(/^\/error5/i, error.serverError, tpl.html('50x.pug'))
    .get(/^\/error/i, error.notFound, tpl.html('40x.pug'))
    // logout
    .all('/logout', user.logout)
    .get('/purge', cache, tpl.html('cache.pug'))
    .get('/purge/:id', cache, tpl.html('cache.pug'))
    // app
    .get('/app', about.app, tpl.html('app.pug'))
    // enterprise recharge
    .get(
      '/enterprise/recharge/result/baofu',
      enterprise.rechargeResultBaofu,
      tpl.html('enterprise.recharge.result.pug')
    )
    .get('/enterprise/recharge', tpl.html('enterprise.pug'))
    .post(
      '/enterprise/recharge',
      enterprise.recharge,
      tpl.html('enterprise.recharge.skip.pug')
    )
    //home
    .get('/', home, tpl.html('home.pug'));
  return router;
}
/**
 * mobile router
 */
function mobileRouter() {
  const router = new Router();
  // true/false for input blur check
  router
    .post('/api/riskvail', mobile.riskvail.evaluate)
    .post('/api/weixin/sign', mobile.user.ajaxWeixinSign)
    .post('/api/checkMobile', user.checkMobile)
    .post(
      '/api/verifycode/send',
      mobile.user.verifyCaptcha,
      user.sendVerifyCode
    )
    .post(
      '/api/register',
      mobile.user.signupPost,
      tpl.jsonHtml('./mobile/propoganda.register.result.pug')
    )
    .post(
      '/landing/invite',
      mobile.landing.shareQrcode,
      tpl.html('./mobile/landing.invite.pug')
    )
    .get(
      '/agreement/:action',
      mobile.about.agreement,
      tpl.html('./mobile/manual.signup.agree.pug')
    )
    //.get('/landing/deposit', mobile.user.assignInfo, tpl.html('./mobile/landing.deposit.pug'))
    .get('/landing/deposit', mobile.user.assignInfo, tpl.html('./mobile/landing.new.depository.pug'))
    .get('/landing/novice', mobile.user.assignInfo, mobile.landing.noviceArea, tpl.html('./mobile/landing.novice.area.pug'))
    //.get('/landing/newedition', tpl.html('./mobile/landing.newedition.pug'))
    .get('/landing/trust', tpl.html('./mobile/landing.trust.pug'))
    .get(
      '/landing/invite/register/:id',
      mobile.landing.inviteRegister,
      tpl.html('./mobile/landing.invite.register.pug')
    )
    .get(
      '/landing/luxury',
      mobile.landing.registerShare,
      tpl.html('./mobile/landing.register.luxury.pug')
    )
    .get(
      '/landing/carnival',
      mobile.landing.carnival,
      tpl.html('./mobile/landing.carnival.pug')
    )
    .get(
      '/landing/register/give',
      mobile.landing.registerShare,
      tpl.html('./mobile/landing.register.give.pug')
    )
    .get(
      '/landing/register/weisha', tpl.html('./mobile/landing.register.weisha.pug')
    )
    .get(
      '/landing/carnival/:action',
      mobile.landing.carnival,
      tpl.html('./mobile/landing.carnival.pug')
    )
    .get(
      '/landing/invite/:id',
      mobile.landing.inviteShare,
      tpl.html('./mobile/landing.invite.qrcode.pug')
    )
    .get('/landing/invite', tpl.html('./mobile/landing.invite.pug'))
    .get(
      '/landing/about/:id',
      mobile.landing.about,
      tpl.html('./mobile/landing.invite.detail.pug')
    )
    .get(
      '/landing/jdcard/register',
      mobile.landing.registerJdCard,
      tpl.html('./mobile/landing.jdcard.register.pug')
    )
    // 只在app中使用
    .get(
      '/landing/jdcard/invest',
      mobile.landing.investedGift,
      tpl.html('./mobile/landing.jdcard.invest.pug')
    )
    .get(
      '/landing/ordinary',
      mobile.landing.registerJdCard,
      tpl.html('./mobile/landing.ordinary.pug')
    )
    .get(
      '/landing/miya/signup',
      mobile.landing.miya,
      tpl.html('./mobile/landing.miya.signup.pug')
    )
    .get(
      '/landing/duanwu',
      mobile.landing.duanwu,
      tpl.html('./mobile/landing.duanwu.pug')
    )
    .get('/qrcode/:action/:id', user.qrcode)
    .get('/captcha', user.captcha)
    .get('/riskvail', mobile.riskvail.home, tpl.html('./mobile/riskvail.pug'))
    .get(
      '/acount/loan/:id/agreement',
      mobile.account.loanAgreement,
      tpl.html('./mobile/manual.loan.agree.pug')
    )
    .get(
      '/acount/:action/:id/agreement',
      mobile.account.planAgreement,
      tpl.html('./mobile/manual.plan.agree.pug')
    )
    .get(
      '/about/announcement/:id',
      mobile.about.announcementDetail,
      tpl.html('./mobile/announcement.detail.pug')
    )
    .get('/download', about.app, tpl.html('mobile/download.pug'))
    .get('/questions', about.helpBankLimit, tpl.html('./mobile/questions.pug'))
    .get('/announce', tpl.html('mobile/announce.detail.pug'))
    .get('/wscredit', tpl.html('mobile/wscredit.pug'))
    .get('/about/:action', mobile.about.navs)
    .get('/about/report/:id', mobile.about.annals)
    .get(
      '/landing/highpoint',
      mobile.landing.highPoint,
      tpl.html('./mobile/landing.highpoint.pug')
    )
    .get(
      '/landing/financing',
      mobile.landing.highPoint,
      tpl.html('./mobile/landing.financing.pug')
    )
    .get(
      '/landing/miya',
      mobile.landing.miya,
      tpl.html('./mobile/landing.miya.pug')
    )
    .get(
      '/landing/miya/turntable',
      mobile.landing.miyaTurntable,
      tpl.html('./mobile/landing.miya.turntable.pug')
    )
    .get('/purge', cache, tpl.html('cache.pug'))
    .get('/purge/:id', cache, tpl.html('cache.pug'))
    //invite friends
    .get('/discount/explain', tpl.html('./mobile/discount.explain.pug'))
    .get(
      '/account/invite',
      mobile.account.invite,
      tpl.html('./mobile/account.invite.pug')
    )
    .get('/', mobile.home, tpl.html('./mobile/home.pug'));
  return router;
}
/**
 * API router
 */
function apiRouter() {
  // true/false for input blur check
  const router = new Router();
  router
    .post('/checkMobile', apiServer.user.checkMobile)
    .post('/checkExistMobile', apiServer.user.checkExistMobile)
    .post('/user/signup', apiServer.user.signupPost)
    .post('/user/login', apiServer.user.loginPost)
    .post('/user/logout', apiServer.user.loginRequired, apiServer.user.logout)
    .post('/user/forgot', apiServer.user.forgot)
    .post('/logout', apiServer.user.loginRequired, apiServer.user.logout)
    .post('/forgot', apiServer.user.forgot)
    .post(
      '/user/realname',
      apiServer.user.loginRequired,
      apiServer.user.realname
    )
    .post('/user/escrow', apiServer.user.loginRequired, apiServer.user.escrow)
    // token
    .get('/token', apiServer.token)
    .get('/captcha', apiServer.user.captcha)
    .post(
      '/checkCaptcha',
      apiServer.user.verifyCaptcha,
      apiServer.user.captchaResult
    )
    //从v2.3.0开始，所有的发送短信只用一个接口
    .post(
      '/verifycode/send',
      apiServer.user.verifyCaptcha,
      apiServer.user.sendVerifyCode
    )
    //以下4个发送短信验证码的接口，从v2.3.0版本开始逐渐废弃
    .post(
      '/send/smscode',
      apiServer.user.verifyCaptcha,
      apiServer.user.sendVerifyCode
    )
    .post(
      '/send/smscode/base',
      apiServer.user.verifyCaptcha,
      apiServer.user.sendVerifyCode
    )
    .post(
      '/account/smscode/:action',
      apiServer.user.verifyCaptcha,
      apiServer.user.sendVerifyCode
    )
    .post(
      '/account/quickpay/smscode',
      apiServer.user.verifyCodeAction('recharge'),
      apiServer.user.verifyCaptcha,
      apiServer.user.sendVerifyCode
    )
    .post('/checkIdentityAuth', apiServer.user.checkIdentity)
    // user
    .get('/user/info', apiServer.user.loginRequired, apiServer.account.detail)
    .get(
      '/account/info',
      apiServer.user.loginRequired,
      apiServer.account.detail
    )
    .get('/account/plan', apiServer.user.loginRequired, apiServer.account.plan)
    .get(
      '/account/planAssets',
      apiServer.user.loginRequired,
      apiServer.account.planAssets
    )
    .get(
      '/account/plan/:id',
      apiServer.user.loginRequired,
      apiServer.account.planDetail
    )
    .get(
      '/account/plan/:id/loanRecord',
      apiServer.user.loginRequired,
      apiServer.account.planToLoanRecord
    )
    .post(
      '/account/plan/:id/quit',
      apiServer.user.loginRequired,
      apiServer.account.planQuit
    )
    .post(
      '/account/plan/:id/cancelbuy',
      apiServer.user.loginRequired,
      apiServer.account.planCancelBuy
    )
    .get('/account/loan', apiServer.user.loginRequired, apiServer.account.loan)
    .get(
      '/account/loanAssets',
      apiServer.user.loginRequired,
      apiServer.account.loanAssets
    )
    .get(
      '/account/tradlist',
      apiServer.user.loginRequired,
      apiServer.account.tradList
    )
    .get(
      '/account/transfer',
      apiServer.user.loginRequired,
      apiServer.account.transferList
    )
    .post(
      '/account/transfer/:id/confirm',
      apiServer.user.loginRequired,
      apiServer.account.transferConfirm
    )
    .post(
      '/account/transfer/:id/result',
      apiServer.user.loginRequired,
      apiServer.account.transferResult
    )
    .post(
      '/user/checkLoginPassword',
      apiServer.user.loginRequired,
      apiServer.user.checkLoginPassword
    )
    .post(
      '/user/riskModifyScore',
      apiServer.user.loginRequired,
      apiServer.user.riskModifyScore
    )
    .post(
      '/user/checkCardBin',
      apiServer.user.loginRequired,
      apiServer.user.checkCardBin
    )
    .get(
      '/account/advisor',
      apiServer.user.loginRequired,
      apiServer.account.advisor
    )
    // 个人中心首页
    .get('/account', apiServer.user.loginRequired, apiServer.account.home)
    // 我的优惠券列表
    .post(
      '/account/coupon',
      apiServer.user.loginRequired,
      apiServer.coupon.query
    )
    //account setting
    .post(
      '/account/mobile',
      apiServer.user.loginRequired,
      apiServer.user.verifyCaptcha,
      apiServer.accountSetting.mobile
    )
    .post(
      '/account/password',
      apiServer.user.loginRequired,
      apiServer.accountSetting.password
    )
    .post(
      '/account/checkSmsCode',
      apiServer.user.loginRequired,
      apiServer.accountSetting.checkSmsCode
    )
    .post(
      '/account/authentication',
      apiServer.user.loginRequired,
      apiServer.accountSetting.authentication
    )
    .post(
      '/account/tradCashPwd',
      apiServer.user.loginRequired,
      apiServer.accountSetting.setCashPassword
    )
    .post(
      '/account/checkIdentitySms',
      apiServer.user.loginRequired,
      apiServer.accountSetting.accountIdentitySmsCode
    )
    //withdraw recharge
    .post(
      '/account/secure',
      apiServer.user.loginRequired,
      apiServer.accountSetting.secureAuth
    )
    // 提现页
    .get(
      '/account/withdraw',
      apiServer.user.loginRequired,
      apiServer.withdraw.home
    )
    .post(
      '/account/withdraw',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.withdraw
    )
    .post(
      '/account/withdraw/arriveTime',
      apiServer.user.loginRequired,
      apiServer.account.withdrawTime
    )
    .post(
      '/account/withdraw/record',
      apiServer.user.loginRequired,
      apiServer.withdraw.query
    )
    .post(
      '/account/cashpwd/edit',
      apiServer.user.loginRequired,
      apiServer.accountSetting.editCashPassword
    )
    .post(
      '/account/quickpay',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.quickPay
    )
    // 银行卡
    .get('/banklist', apiServer.account.bankList)
    .get(
      '/account/user/card',
      apiServer.user.loginRequired,
      apiServer.account.bankCard
    ) // 2.3 之后不能使用
    .post(
      '/account/bindcard',
      apiServer.user.loginRequired,
      apiServer.account.bankCardBind
    ) // 2.3 之后不能使用
    .get(
      '/account/bankcard',
      apiServer.user.loginRequired,
      apiServer.account.bankCard
    )
    .post(
      '/account/bankcard/bind',
      apiServer.user.loginRequired,
      apiServer.account.bankCardBind
    )
    .post(
      '/account/bankcard/unbind',
      apiServer.user.loginRequired,
      apiServer.account.bankCardUnbind
    )
    // 邀请
    .post(
      '/account/invite/list',
      apiServer.user.loginRequired,
      apiServer.invite.query
    )
    .post(
      '/account/invite/overview',
      apiServer.user.loginRequired,
      apiServer.invite.overview
    )
    //page
    .get('/loan', apiServer.loan.list)
    .get('/loan/:id', apiServer.loan.detail)
    .get('/loan/:id/record', apiServer.loan.record)
    .post(
      '/loan/:id/confirm',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.riskVerify,
      apiServer.loan.buyConfirm
    )
    .post(
      '/loan/:id/result',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.riskVerify,
      apiServer.loan.buyResult
    )
    .get('/plan', apiServer.plan.list)
    .get('/plan/investlist', apiServer.plan.investList)
    .get('/plan/:id', apiServer.plan.detail)
    .get('/plan/:id/record', apiServer.plan.record)
    .post(
      '/plan/:id/confirm',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.riskVerify,
      apiServer.plan.buyConfirm
    )
    .post(
      '/plan/:id/result',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.riskVerify,
      apiServer.plan.buyResult
    )
    .get('/transfer', apiServer.loan.transfer)
    .get('/transfer/:id/record', apiServer.loan.debtRecord)
    .get('/transfer/:id/transferRecord', apiServer.loan.transferRecord)
    .post(
      '/transfer/:id/result',
      apiServer.user.loginRequired,
      apiServer.account.escrowVerify,
      apiServer.account.riskVerify,
      apiServer.loan.transferBuy
    )
    .get('/transfer/:id', apiServer.loan.transferDetail)
    // coupon
    .post(
      '/coupon/exchange',
      apiServer.user.loginRequired,
      apiServer.coupon.update
    )
    .post(
      '/coupon/query',
      apiServer.user.loginRequired,
      apiServer.coupon.queryBuy
    )
    .post('/coupon/best', apiServer.user.loginRequired, apiServer.coupon.best)
    // splash
    .get('/splash', apiServer.splash)
    // popups
    .get('/popups', apiServer.home.popups)
    // share
    .post('/share', apiServer.share)
    //home
    .get('/home', apiServer.home)
    //announce
    .get('/announce', apiServer.home.announceList)
    //update
    .post('/update', apiServer.upgrade.appUpdate)
    //cache
    .get('/purge', cache, tpl.html('cache.pug'))
    .get('/purge/:id', cache, tpl.html('cache.pug'));
  return router;
}
module.exports = function(config) {
  const state = config.state || 'web';
  if (state === 'api') {
    return apiRouter();
  }
  if (state === 'mobile') {
    return mobileRouter();
  }
  return webRouter();
};