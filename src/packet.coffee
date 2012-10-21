sprintf    = require './../support/sprintf'
utils      = require './utils'
Converters = require './packet/converters'

String::stripBinNull = ->
  pos = @indexOf '\u0000'
  if pos == -1 then @ else @substr 0, pos

fromBuffer = (b) ->
  ret =
    op: b[0]
    htype: b[1]
    hlen: b.readUInt8 2
    hops: b.readUInt8 3
    xid: b.readUInt32BE 4 # 4 bytes
    secs: b.readUInt16BE 8 # 2 bytes
    flags: b.readUInt16BE 10 # 2 bytes
    ciaddr: utils.readIp b, 12
    yiaddr: utils.readIp b, 16
    siaddr: utils.readIp b, 20
    giaddr: utils.readIp b, 24
    chaddr: utils.readMacAddress b.slice(28, 28+b.readUInt8(2))
    sname: b.toString('ascii', 44, 108).stripBinNull()
    file: b.toString('ascii', 108, 236).stripBinNull()
    options: {}

  [i, options] = [0, b.slice(240)]
  while i < options.length and options[i] != 255
    optNum = parseInt options[i++], 10
    optLen = parseInt options[i++], 10
    optVal = Converters.get(optNum).decode(options.slice(i, i+optLen))
    ret.options[optNum] = optVal
    i += optLen

  new Packet ret

toBuffer = () ->
  buffer = new Buffer 512, 'ascii'

  buffer[0] = @op
  buffer[1] = @htype
  buffer.writeUInt8 @hlen, 2
  buffer.writeUInt8 @hops, 3
  buffer.writeUInt32BE @xid, 4
  buffer.writeUInt16BE @secs, 8
  buffer.writeUInt16BE @flags, 10
  
  pos = 12
  for key in ["ciaddr", "yiaddr", "siaddr", "giaddr"]
    for octet in (@[key] or "0.0.0.0").split(".")
      buffer.writeUInt8 parseInt(octet, 10), pos++

  for hex in @chaddr.split ':'
    buffer[pos++] = parseInt hex, 16
  
  # fill bootp range with zeros
  buffer.fill 0, pos, 235
  
  # magic cookie
  pos = 236
  buffer[pos++] = i for i in [99, 130, 83, 99]
  
  # dhcp options payload starts at byte 240
  pos = 240
  for opt of @options
    value = @options[opt]
    pos = Converters.get(opt).encode(buffer, opt, value, pos)
  
  # mark the packet's end with 0xff
  buffer[pos] = 255
  
  # return a node buffer
  padded = new Buffer pos, 'ascii'
  buffer.copy padded, 0, 0, pos
  padded


class Packet
  @fromBuffer: fromBuffer

  constructor: (array) ->
    @[key] = array[key] for key of array

  toBuffer: toBuffer

  getRequestedIPAddress: ->
    @options[50]

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
  file:     (@file)   -> this
  options:  (@options)-> this

module.exports =
  Packet: Packet
  fromBuffer: fromBuffer
  toBuffer: toBuffer
