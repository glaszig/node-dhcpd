/**
 * option 51: lease time
 * http://tools.ietf.org/html/rfc2132#section-9.2
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

function decode(buf) {
  return utils.readInt32(buf, 0);
}

function encode(buf, num, value, offset) {
  buf[offset++] = num;
  buf[offset++] = 4;
  utils.writeInt32(buf, value, offset);
  return offset+4;
}

module.exports = {
  "encode": encode, "decode": decode
}