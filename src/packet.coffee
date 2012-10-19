sprintf = require('./../support/sprintf')
converters = require('./converters')
utils = require('./utils')

extractChaddr = (b) -> 
  [f, len, reg] = ["%02x", b[2], []]
  bytes = b.slice(28, 28+len)
  (sprintf(f, octet) for byte in bytes).join ':'

fromBuffer = (b) ->
  ret =
    op: b[0]
    htype: b[1]
    hlen: b[2]
    hops: b[3]
    xid: utils.readInt32(b, 4) # b[4] + b[5] + b[6] + b[7];
    secs: utils.readInt16(b, 8) # b[8] + b[9];
    flags: utils.readInt16(b, 10) # b[10] + b[11];
    ciaddr: sprintf('%d.%d.%d.%d', b[12], b[13], b[14], b[15])
    yiaddr: sprintf('%d.%d.%d.%d', b[16], b[17], b[18], b[19])
    siaddr: sprintf('%d.%d.%d.%d', b[20], b[21], b[22], b[23])
    giaddr: sprintf('%d.%d.%d.%d', b[24], b[25], b[26], b[27])
    chaddr: extractChaddr(b)
    sname: ''

  ret.sname = (s for b in b.slice 44, 44+64).join ''
  ret.file = (s for b in b.slice 108, 236).join ''

  [i, options] = [0, b.slice(240)]
  while i < options.length and options[i] != 255
    optNum = parseInt options[i++], 10
    optLen = parseInt options[i++], 10
    optVal = converters(opt).decode(options.slice(i, i+optLen))
    ret.options[optNum] = optVal
    i += optLen

  ret

toBuffer = (data) ->
  buffer = []
  pos = 0
  buffer[pos++] = data.op
  buffer[pos++] = data.htype
  buffer[pos++] = data.hlen
  buffer[pos++] = data.hops
  utils.writeInt32 buffer, data.xid, pos
  pos += 4
  utils.writeInt16 buffer, data.secs, pos
  pos += 2
  utils.writeInt16 buffer, data.flags, pos
  pos += 2
  ["ciaddr", "yiaddr", "siaddr", "giaddr"].forEach (key) ->
    (data[key] or "0.0.0.0").split(".").forEach (item) ->
      buffer[pos++] = parseInt(item)

  data.chaddr.split(":").forEach (item) ->
    buffer[pos++] = parseInt(item, 16)
  
  # fill bootp range with zeros
  buffer[pos++] = 0  while pos < 236
  
  # magic cookie
  buffer[pos++] = 99
  buffer[pos++] = 130
  buffer[pos++] = 83
  buffer[pos++] = 99
  
  # dhcp options payload starts at byte 240
  pos = 240
  for opt of data.options
    value = data.options[opt]
    pos = converters(opt).encode(buffer, opt, value, pos)
  
  # mark the packet's end with 0xff
  buffer[pos] = 255
  
  # return a node buffer
  new Buffer(buffer, "ascii")


class Packet
  @fromBuffer: fromBuffer
  toBuffer: toBuffer
  op:       (@op)     -> this
  htype:    (@htype)  -> this
  hlen:     (@hlen)   -> this
  hops:     (@hops)   -> this
  xid:      (@xid)    -> this
  secs:     (@secs)   -> this
  flags:    (@flags)  -> this
  ciaddr:   (@ciaddr = '0.0.0.0') -> this
  yiaddr:   (@yiaddr = '0.0.0.0') -> this
  siaddr:   (@siaddr = '0.0.0.0') -> this
  giaddr:   (@giaddr = '0.0.0.0') -> this
  chaddr:   (@chaddr) -> this
  sname:    (@sname)  -> this

module.exports =
  Packet: Packet
  fromBuffer: fromBuffer
  toBuffer: toBuffer

