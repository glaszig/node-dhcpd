/*
option 1: subnet mask
*/
var utils = require("../../../utils");

module.exports = {
  encode: utils.writeIP,
  decode: utils.readIP
};
