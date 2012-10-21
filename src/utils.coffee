sprintf = require("./../support/sprintf")
module.exports =
  
  #
  # WRITING
  #
  
  ###
  Writes an array with bytes to the packets Buffer from the current position
  
  @param {Array} byteArray A simple array with uint8 values ([0x00, 0xFF])
  @return {Packet}
  ###
  writeBytes: (_buffer, byteArray, offset) ->
    i = 0
    while i < byteArray.length
      _buffer[offset++] = byteArray[i]
      i++
    _bytesWritten = offset  if offset > _bytesWritten
    this

  
  ###
  Write a 4-byte integer
  
  @param {integer} integer The value to write to the packet
  @return {Packet}
  ###
  writeInt32: (_buffer, integer, offset) ->
    _buffer[offset++] = (integer >>> 24)
    _buffer[offset++] = (integer >>> 16)
    _buffer[offset++] = (integer >>> 8)
    _buffer[offset++] = integer
    offset

  
  ###
  Write a 2-byte integer
  
  @param {integer} integer The value to write to the packet
  @return {Packet}
  ###
  writeInt16: (_buffer, integer, offset) ->
    _buffer[offset++] = (integer >>> 8)
    _buffer[offset++] = integer
    offset

  
  ###
  Write a 1-byte integer
  
  @param {integer} integer The value to write to the packet
  @return {Packet}
  ###
  writeInt8: (_buffer, integer, offset) ->
    _buffer[offset++] = integer
    offset

  
  #
  # READING
  #
  
  ###
  Reads the given length of bytes from the packets Buffer
  and optionally (if the copy argument is true) creates a real copy of the Buffer
  
  @param {Integer} length
  @param {Boolean} copy
  @return {Buffer}
  ###
  readBytes: (_buffer, length, copy, offset) ->
    if copy
      bufCopy = new Buffer(length)
      _buffer.copy bufCopy, 0, offset, (offset += length)
      bufCopy
    else
      _buffer.slice offset, (offset += length)

  
  ###
  Reads a 4-byte integer from the packet
  
  @return {Integer}
  ###
  readInt32: (_buffer, offset) ->
    (_buffer[offset++] << 24) | (_buffer[offset++] << 16) | (_buffer[offset++] << 8) | _buffer[offset++]

  
  ###
  Reads a 2-byte integer from the packet
  
  @return {Integer}
  ###
  readInt16: (_buffer, offset) ->
    (_buffer[offset++] << 8) | _buffer[offset++]

  
  ###
  Reads a 1-byte integer from the packet
  
  @return {Integer}
  ###
  readInt8: (_buffer, offset) ->
    _buffer[offset++]

  
  # 
  # OTHER
  # 
  readString: (buf) ->
    s = ""
    j = 0

    while j < buf.length
      s += String.fromCharCode(buf[j])
      j++
    s

  readHex: (buf) ->
    s = ""
    j = 0

    while j < buf.length
      s += sprintf("%02x", b[j])
      j++
    s

  readHexAddress: (buf) ->
    s = []
    j = 0

    while j < buf.length
      s.push sprintf("%02d", buf[j])
      j++
    s.join ":"
    
  readIp: (buffer, offset = 0) ->
    if 0 == buffer.readUInt8 offset
      undefined
    else
      stop = offset + 4
      (buffer.readUInt8(offset++) while offset < stop).join '.'

  readMacAddress: (buffer) ->
    ((byte + 0x100).toString(16).substr(-2) for byte in buffer).join ':'

  writeTimeOffset: (buf, num, offsetHours, offset) ->
    
    #
    #    // http://www.cisco.com/en/US/tech/tk86/tk804/technologies_tech_note09186a0080093d76.shtml
    #    var secs = global.HOUR * offsetHours;
    #    if (secs < 0) Math.pow(2, 32) + secs;
    #    var hex = sprintf('%08X', secs);
    #    
    buf[offset++] = 0
    offset

  writeIp: (buf, num, ip, offset) ->
    buf[offset++] = num
    buf[offset++] = 4
    ip.split(".").forEach (item) ->
      buf[offset++] = item

    offset

  writeString: (buf, num, hostname, offset) ->
    charArr = hostname.split("")
    buf[offset++] = num
    buf[offset++] = charArr.length
    charArr.forEach (chr) ->
      buf[offset++] = chr.charCodeAt()

    offset
