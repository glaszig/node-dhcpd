/*
option 55: parameter request list
http://tools.ietf.org/html/rfc2132#section-9.8
*/

module.exports = {
  encode: function(buf, num, value, offset) {
    return offset;
  },

  decode: function(buf) {
    var j, ret;
    ret = [];
    j = 0;
    while (j < buf.length) {
      ret.push(buf[j]);
      j++;
    }
    return ret;
  }
};

