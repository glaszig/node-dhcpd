var sprintf = require('./../support/sprintf');
module.exports = {
  
//
// WRITING
//
  
  /**
   * Writes an array with bytes to the packets Buffer from the current position
   *
   * @param {Array} byteArray A simple array with uint8 values ([0x00, 0xFF])
   * @return {Packet}
   */
  writeBytes: function(_buffer, byteArray, offset){
    for(i = 0; i < byteArray.length; i++) {
      _buffer[offset++] = byteArray[i];
    }
    if(offset > _bytesWritten) {
      _bytesWritten = offset;
    }
    return this;
  },
  
  /**
   * Write a 4-byte integer
   *
   * @param {integer} integer The value to write to the packet
   * @return {Packet}
   */
  writeInt32: function(_buffer, integer, offset) {
    _buffer[offset++] = (integer >>> 24);
    _buffer[offset++] = (integer >>> 16);
    _buffer[offset++] = (integer >>> 8);
    _buffer[offset++] = integer;
    return offset;
  },
  
  /**
   * Write a 2-byte integer
   *
   * @param {integer} integer The value to write to the packet
   * @return {Packet}
   */
  writeInt16: function(_buffer, integer, offset) {
    _buffer[offset++] = (integer >>> 8);
    _buffer[offset++] = integer;
    return offset;
  },
  
  /**
   * Write a 1-byte integer
   *
   * @param {integer} integer The value to write to the packet
   * @return {Packet}
   */
  writeInt8: function(_buffer, integer, offset) {
    _buffer[offset++] = integer;
    return offset;
  },
  
//
// READING
//
  
  /**
   * Reads the given length of bytes from the packets Buffer
   * and optionally (if the copy argument is true) creates a real copy of the Buffer
   *
   * @param {Integer} length
   * @param {Boolean} copy
   * @return {Buffer}
   */
  readBytes: function(_buffer, length, copy, offset){
    if(copy){
      var bufCopy = new Buffer(length);
      _buffer.copy(bufCopy, 0, offset, (offset += length));
      return bufCopy;
    } else {
      return _buffer.slice(offset, (offset += length));
    }
  },
  
  /**
   * Reads a 4-byte integer from the packet
   *
   * @return {Integer}
   */
  readInt32: function(_buffer, offset) {
    return (_buffer[offset++] << 24) | (_buffer[offset++] << 16) | (_buffer[offset++] << 8) | _buffer[offset++];    
  },
  
  /**
   * Reads a 2-byte integer from the packet
   *
   * @return {Integer}
   */
  readInt16: function(_buffer, offset) {
    return (_buffer[offset++] << 8) | _buffer[offset++];
  },
  
  /**
   * Reads a 1-byte integer from the packet
   *
   * @return {Integer}
   */
  readInt8: function(_buffer, offset) {
    return _buffer[offset++];
  },
  
// 
// OTHER
// 
  
  readString: function(buf) {
    var s = '';
    for (var j = 0; j < buf.length; j++) {
      s += String.fromCharCode(buf[j]);
    }
    return s;
  },
  
  readHex: function(buf) {
    var s = '';
    for (var j = 0; j < buf.length; j++) {
      s += sprintf("%02x", b[j]);
    }
    return s;
  },
  
  readHexAddress: function(buf) {
    var s = [];
    for (var j = 0; j < buf.length; j++) {
      s.push(sprintf("%02d", buf[j]));
    }
    return s.join(':');
  },
  
  readIp: function(buf) {
    return sprintf("%d.%d.%d.%d", buf[0], buf[1], buf[2], buf[3]);
  },
  
  writeTimeOffset: function(buf, num, offsetHours, offset) {
    /*
    // http://www.cisco.com/en/US/tech/tk86/tk804/technologies_tech_note09186a0080093d76.shtml
    var secs = global.HOUR * offsetHours;
    if (secs < 0) Math.pow(2, 32) + secs;
    var hex = sprintf('%08X', secs);
    */
    buf[offset++] = 0;
    return offset;
  },

  writeIp: function(buf, num, ip, offset) {
    buf[offset++] = num;
    buf[offset++] = 4;
    ip.split('.').forEach(function(item) {
      buf[offset++] = item;
    });
    return offset;
  },

  writeString: function (buf, num, hostname, offset) {
    var charArr = hostname.split('');
    buf[offset++] = num;
    buf[offset++] = charArr.length;
    charArr.forEach(function (chr) {
      buf[offset++] = chr.charCodeAt();
    });
    return offset;
  } 
  
};
