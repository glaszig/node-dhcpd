###
option 61: client identifier
http://tools.ietf.org/html/rfc2132#section-9.14
###
encode = (buf, num, value, offset) ->
  offset
decode = (buf) ->
  s = []
  type = buf[0]
  j = 1

  while j < buf.length
    s.push sprintf("%02d", buf[j])
    j++
  [type, s.join(":")]
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
