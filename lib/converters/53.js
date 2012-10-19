/**
 * option 53: message type
 * http://tools.ietf.org/html/rfc2132#section-9.6
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {
  decode: function(buf) { 
    return sprintf("%d", buf[0]); 
  },
  encode: function(buf, num, value, offset) {
    buf[offset++] = 53;
    buf[offset++] = 1;
    buf[offset++] = value;
    return offset;
  }
}