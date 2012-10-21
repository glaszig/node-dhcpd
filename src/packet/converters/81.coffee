###
client fqdn
http://tools.ietf.org/html/rfc4702#section-2
###
encode = (buf, num, value, offset) ->
  offset
decode = (buf) ->
  ret = ""
  ret += sprintf("%d", buf[0]) + "-"
  ret += sprintf("%d", buf[1]) + "-"
  ret += sprintf("%d", buf[2]) + " "
  ret += utils.toString(buf.slice(3))
  ret
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
