/*
option 31: router discovery
http://tools.ietf.org/html/rfc2132#section-5.6
*/
var utils = require("../../utils");

module.exports = {
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 1;
    utils.writeInt8(buf, value, offset);
    return offset + 1;
  },

  decode: function(buf) {
    return utils.readInt8(buf, 0);
  }
};
