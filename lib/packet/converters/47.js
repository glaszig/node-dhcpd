/*
option 47: netbios node type
http://tools.ietf.org/html/rfc2132#section-8.8
*/
var utils = require("../../../utils");

module.exports = {
  encode: utils.writeString,
  decode: utils.readString
};
