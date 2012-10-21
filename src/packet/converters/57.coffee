###
option 57: max message size
http://tools.ietf.org/html/rfc2132#section-9.10
###
encode = (buf, num, value, offset) ->
  buf[offset++] = 57
  buf[offset++] = 2
  utils.writeInt16 buf, value, offset
  offset + 2
decode = (buf) ->
  utils.readInt16 buf, 0
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
