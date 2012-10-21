###
option 3: routers
###
decode = (buf) ->
  numRecords = buf.length / 4
  pos = 0
  records = []
  i = 0

  while i < numRecords
    records.push sprintf("%d.%d.%d.%d", buf[pos++], buf[pos++], buf[pos++], buf[pos++])
    i++
  records
encode = (buf, num, data, offset) ->
  routers = data
  buf[offset++] = num
  buf[offset++] = routers.length * 4
  routers.forEach (ip) ->
    ip.split(".").forEach (item) ->
      buf[offset++] = item


  offset
sprintf = require("../../../support/sprintf")
utils = require("../../utils")
module.exports =
  encode: encode
  decode: decode
