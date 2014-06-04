/*
option 57: max message size
http://tools.ietf.org/html/rfc2132#section-9.10
*/
var utils = require("../../../utils");

module.exports = {
  encode: function(buf, num, value, offset) {
    buf[offset++] = 57;
    buf[offset++] = 2;
    utils.writeInt16(buf, value, offset);
    return offset + 2;
  },

  decode: function(buf) {
    return utils.readInt16(buf, 0);
  }
};
