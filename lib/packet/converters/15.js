/*
option 15: dns domain name
http://www.networksorcery.com/enp/protocol/bootp/option015.htm
*/
var utils = require("../../../utils");

module.exports = {
  encode: utils.writeString,
  decode: utils.readString
};
