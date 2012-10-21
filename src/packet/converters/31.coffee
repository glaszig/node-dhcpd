###
option 31: router discovery
http://tools.ietf.org/html/rfc2132#section-5.6
###
encode = (buf, num, value, offset) ->
  buf[offset++] = num
  buf[offset++] = 1
  utils.writeInt8 buf, value, offset
  offset + 1
decode = (buf) ->
  utils.readInt8 buf, 0
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
