//https://github.com/rendro/countdown
var Countdown = require('./countdown.js');

var NAME = 'countdown';
var DATA_ATTR = 'date';
var DATA_NOW = 'now';

jQuery.fn.countdown = function(options) {
  return $.each(this, function(i, el) {
    var $el = $(el);
    if (!$el.data(NAME)) {
      // allow setting the date via the data-date attribute
      if ($el.data(DATA_ATTR)) {
        options.date = $el.data(DATA_ATTR);
      }
      if ( $el.data(DATA_NOW) ) {
        options.offset = (Date.now() - $el.data(DATA_NOW));
      }
      $el.data(NAME, new Countdown(el, options));
    }
  });
};

module.exports = Countdown;
