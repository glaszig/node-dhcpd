###
option 55: parameter request list
http://tools.ietf.org/html/rfc2132#section-9.8
###
encode = (buf, num, value, offset) ->
  offset
decode = (buf) ->
  ret = []
  j = 0

  while j < buf.length
    ret.push buf[j]
    j++
  
  # var key = buf[j], val = dhcp.options[buf[j]];
  # ret[key] = val;
  ret
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
