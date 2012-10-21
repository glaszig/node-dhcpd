###
option 47: netbios node type
http://tools.ietf.org/html/rfc2132#section-8.8
###
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
decode = utils.readString
encode = utils.writeString
module.exports =
  encode: encode
  decode: decode
