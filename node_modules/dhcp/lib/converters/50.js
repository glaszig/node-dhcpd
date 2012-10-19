/**
 * option 50: requested ip address
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

module.exports = {
  encode: utils.writeIp,
  decode: utils.readIp
}