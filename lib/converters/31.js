/**
 * option 31: router discovery
 * http://tools.ietf.org/html/rfc2132#section-5.6
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {"encode": encode, "decode": decode};

function encode(buf, num, value, offset) {
  buf[offset++] = num;
  buf[offset++] = 1;
  utils.writeInt8(buf, value, offset);
  return offset + 1;
}

function decode(buf) {
  return utils.readInt8(buf, 0);
}