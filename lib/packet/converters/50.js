/*
option 50: requested ip address
*/
var utils = require("../../../utils");

module.exports = {
  encode: utils.writeIp,
  decode: utils.readIp
};
