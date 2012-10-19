/**
 * option 57: max message size
 * http://tools.ietf.org/html/rfc2132#section-9.10
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {"encode": encode, "decode": decode};

function encode(buf, num, value, offset) {
  buf[offset++] = 57;
  buf[offset++] = 2;
  utils.writeInt16(buf, value, offset);
  return offset + 2;
}
function decode(buf) {
  return utils.readInt16(buf, 0);
}