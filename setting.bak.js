'use strict';

const path = require('path');

const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;
const state = process.env.STATE || 'web'; // web/mobile/api
//const state = process.env.STATE || 'mobile';
//const state = process.env.STATE || 'api';
const host = process.env.HOST || '0.0.0.0';
const view_tpl_path = path.resolve(__dirname, './tpl');
var _ttl = 2 * 60 * 60;
if (state === 'api') {
  _ttl = 24 * 60 * 60 * 15;
}
const DEBUG = (env !== 'production');

const web_isConsole = false;

// global locals
const global_view_locals = {
  site_name: '红小宝',
  site_title: '红小宝官网 -【恒丰银行资金存管】 网络借贷信息中介平台',
  site_keywords: '红小宝，红小宝理财，P2P投资平台，P2P排名，P2P网贷，红上财富',
  site_description: '红小宝专业互联网金融平台,恒丰银行存管,注册资金2亿元,平均历史年化收益11.9%,1000元起投,智能风控,交易过程公开透明,为您的资金保驾护航！'
};

const redis_session = {
  host: '127.0.0.1',
  port: 6379,
  db: 2,
  options: {
    auth_pass: 'HoomSun1',
  },
  keySchema: 'session',
  ttl: _ttl
};

const redis_get = {
  host: '127.0.0.1',
  port: 6379,
  db: 1,
  options: {
    auth_pass: 'HoomSun1',
  },
};

var loggerConfig = {
  appenders: [
    {
      "type": "dateFile",
      "filename": "./logs/date",
      "alwaysIncludePattern": true,
      "backups": 30,
      "pattern": "-yyyy-MM-dd-hh.log"
    }
  ],
  levels: {
    '[all]': 'INFO'
  }
}

if (DEBUG) {
  loggerConfig = {
    appenders: [
      {type: 'console'}
    ]
  }
}

module.exports = {
  name: 'web',
  keys: ['hoomsun', 'by koa2'], // signed cookie keys
  env: env,
  debug: DEBUG,
  console: web_isConsole,
  port: port,
  host: host,
  state: state,
  session: {store: redis_session},
  redis: redis_get,
  //redisMaster: redis_set,
  //redisGet: redis_java_get,
  static: path.join(__dirname, 'static'),
  loggerConfig: loggerConfig,
  baofu: {
    // backNotifyUrl: 'http://123.126.19.2:8070/paycenter/getFuyuouResponse',
    // pageNotifyUrl: 'http://123.126.19.2:3100/account/charge/result',
    // requestFuyouUrl: 'http://www-1.fuiou.com:8888/wg1_run/smpGate.do'
    pageNotifyUrl: '/account/charge/result',
    backNotifyUrl: 'http://escrow.hoomxb.com/escrow/recharge/rechargeCallbackquest'
  },
  view: {
    viewPath: view_tpl_path,
    debug: DEBUG,
    pretty: DEBUG,
    compileDebug: DEBUG,
    helperPath: [
      {'UIHelper': path.resolve(__dirname, './lib/helper.js')},
      {_: require('lodash')}
    ],
    locals: global_view_locals
  },
  upload: {
    uploadDir: path.resolve(__dirname, './static/upload'),
    limit: 5 * 1024 * 1024
  },
  webDomain: 'http://127.0.0.1:3000',
  apiBase: 'http://127.0.0.1:8070/'
  //apiBase: 'http://192.168.1.124:8070/'
  //apiBase: 'http://192.168.1.191:8090'
  //apiBase: 'http://192.168.1.189:8080'
};
