/**
 * option 15: dns domain name
 * http://www.networksorcery.com/enp/protocol/bootp/option015.htm
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils'),
    decode = utils.readString,
    encode = utils.writeString;

module.exports = {
  "encode": encode, "decode": decode
}