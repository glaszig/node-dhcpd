/**
 * option 55: parameter request list
 * http://tools.ietf.org/html/rfc2132#section-9.8
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

function encode(buf, num, value, offset) {
  return offset;
}

function decode(buf) {
  var ret = [];
  for (var j = 0; j < buf.length; j++) {
    ret.push(buf[j]);
    // var key = buf[j], val = dhcp.options[buf[j]];
    // ret[key] = val;
  }
  return ret;
}

module.exports = {"encode": encode, "decode": decode};