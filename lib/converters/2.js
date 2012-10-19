/**
 * option 2: time offset
 * http://tools.ietf.org/html/rfc2132#section-3.4
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {"encode": encode, "decode": decode};

function encode(buf, num, value, offset) {
  buf[offset++] = num;
  buf[offset++] = 4;
  utils.writeInt32(buf, value, offset);
  return offset + 4;
}

function decode(buf) {
  return utils.readInt32(buf, 0);
}