###
option 1: subnet mask
###
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
decode = utils.readIp
encode = utils.writeIp
module.exports =
  encode: encode
  decode: decode
