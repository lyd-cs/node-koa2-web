'use strict';

const qs = require('qs');
const rq = require('request-promise');
const util = require('../lib/util');

const {
  config,
} = util;

var isConsole = config.console;
/*
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}
*/
function checkResponseBody(response) {
  var error;
  if (!response) {
    error = new Error('RESPONSE_EMPTY');
    throw error;
  }
  const json = JSON.parse(response);

  // api response {"status":0,"message":"success","value":{"list":[]}}
  if (json.status == 0) {
    if (json.data) {
      return json.data;
    }
    if (json.value) {
      return json.value;
    }
  }
  error = new Error();
  error._response = response;

  if (json && json.status && json.message) {
    error._message = json.message;
    error._status = json.status;
    error._data = json.data;
  }

  throw error;
}

module.exports = async function request(url, options) {
  let response;
  // default timeout 10s
  if (options && !options.hasOwnProperty('timeout')) {
    options.timeout = 1e4;
  }
  // get append data to url
  if (options &&
    options.hasOwnProperty('method') &&
    'GET' == options.method.toUpperCase() &&
    options.hasOwnProperty('form') &&
    options.form
  ) {
    let delimiter = '?';
    if(url.includes(delimiter)) {
      delimiter = '&';
    }
    url = `${url}${delimiter}${qs.stringify(options.form)}`;
    delete options.form;
  }
  if(isConsole){
    console.log('[Request url]', url);
  }
  //console.log('[url]', url);
  //console.log('[options]', options);
  try {
    response = await rq(url, options);
    //console.log('[response]', response);
  } catch (error) {
    //console.log(error);
    throw error;
  }
  return checkResponseBody(response);
};