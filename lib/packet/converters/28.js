/*
option 28: broadcast address
*/
var utils = require("../../../utils");

module.exports = {
  encode: utils.writeIp,
  decode: utils.readIp
};
