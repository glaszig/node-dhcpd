/*
client fqdn
http://tools.ietf.org/html/rfc4702#section-2
*/
var utils = require("../../utils");
var sprintf = require("../../sprintf");

module.exports = {
  encode: function(buf, num, value, offset) {
    return offset;
  },

  decode: function(buf) {
    var ret;
    ret = "";
    ret += sprintf("%d", buf[0]) + "-";
    ret += sprintf("%d", buf[1]) + "-";
    ret += sprintf("%d", buf[2]) + " ";
    ret += utils.toString(buf.slice(3));
    return ret;
  }
};
