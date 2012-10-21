###
option 2: time offset
http://tools.ietf.org/html/rfc2132#section-3.4
###
encode = (buf, num, value, offset) ->
  buf[offset++] = num
  buf[offset++] = 4
  utils.writeInt32 buf, value, offset
  offset + 4
decode = (buf) ->
  utils.readInt32 buf, 0
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
