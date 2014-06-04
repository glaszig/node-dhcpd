/*
option 46: netbios node type
http://tools.ietf.org/html/rfc2132#section-8.7
*/
module.exports = {
  decode: function(buf) {
    return parseInt(buf[0], 16);
  },
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 1;
    buf[offset++] = parseInt(buf[0], 10).toString(16);
    return offset;
  }
};
