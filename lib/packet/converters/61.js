/*
option 61: client identifier
http://tools.ietf.org/html/rfc2132#section-9.14
*/
var sprintf = require("../../sprintf");
module.exports = {
  encode: function(buf, num, value, offset) {
    return offset;
  },

  decode: function(buf) {
    var j, s, type;
    s = [];
    type = buf[0];
    j = 1;
    while (j < buf.length) {
      s.push(sprintf("%02d", buf[j]));
      j++;
    }
    return [type, s.join(":")];
  }
};
