/**
 * client fqdn
 * http://tools.ietf.org/html/rfc4702#section-2
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {"encode": encode, "decode": decode};

function encode(buf, num, value, offset) {
  return offset;
}

function decode(buf) {
  var ret = '';
  ret += sprintf('%d', buf[0]) + '-';
  ret += sprintf('%d', buf[1]) + '-';
  ret += sprintf('%d', buf[2]) + ' ';
  ret += utils.toString(buf.slice(3));
  return ret;
}