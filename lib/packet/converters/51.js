/*
option 51: lease time
http://tools.ietf.org/html/rfc2132#section-9.2
*/
var utils = require("../../../utils");

module.exports = {
  decode: function(buf) {
    return utils.readInt32(buf, 0);
  },

  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 4;
    utils.writeInt32(buf, value, offset);
    return offset + 4;
  }
};
