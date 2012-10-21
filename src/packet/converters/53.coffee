###
option 53: message type
http://tools.ietf.org/html/rfc2132#section-9.6
###
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  decode: (buf) ->
    parseInt buf[0], 10

  encode: (buf, num, value, offset) ->
    buf[offset++] = 53
    buf[offset++] = 1
    buf[offset++] = value
    offset
