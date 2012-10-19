var sprintf = require('./../support/sprintf'),
    optionDecoders = require('./option_decoders'),
    optionEncoders = require('./option_encoders'),
    converters = require('./converters'),
    utils = require('./utils');

var DHCP = {
  options: require('./options'),
  message_types: require('./message_types')
};
    

var extractChaddr = function(b) {
  var f = "%02x", len = b[2], ret = [];
  for (var i=28; i < 28+len; i++) {
    ret.push(b[i]);
  };
  return ret.map(function(item) { 
    return sprintf(f, item); 
  }).join(':');
}

var fromBuffer = function(b) {
  var ret = {};
  ret.op = b[0];
  ret.htype = b[1];
  ret.hlen = b[2];
  ret.hops = b[3];
  ret.xid = utils.readInt32(b, 4); // b[4] + b[5] + b[6] + b[7];
  ret.secs = utils.readInt16(b, 8); // b[8] + b[9];
  ret.flags = utils.readInt16(b, 10); // b[10] + b[11];
  ret.ciaddr = sprintf('%d.%d.%d.%d', b[12], b[13], b[14], b[15]);
  ret.yiaddr = sprintf('%d.%d.%d.%d', b[16], b[17], b[18], b[19]);
  ret.siaddr = sprintf('%d.%d.%d.%d', b[20], b[21], b[22], b[23]);
  ret.giaddr = sprintf('%d.%d.%d.%d', b[24], b[25], b[26], b[27]);
  ret.chaddr = extractChaddr(b);
  ret.sname = '';
  for(var i=44; i<(44+64); i++) {
    ret.sname += b[i];
  }
  ret.file = '';
  for(; i<(44+64+128); i++) {
    ret.file += b[i];
  }
  
  // iterate through options
  var i = 236; i += 4, ret.options = {};
  while (i < b.length && b[i] != 255) {
    var opt = parseInt(b[i++]), len = b[i++];
    // var s = sprintf("OPTION: %3d (%3d) %-26s", opt, len, DHCP.options[opt]);
    // console.log(s);
    
    // decode option
    // var decoder = optionDecoders[opt] || optionDecoders.fallback;
    // ret.options[opt] = decoder.call(b, b.slice(i, i+len));
    ret.options[opt] = converters(opt).decode(b.slice(i, i+len));
    
    // jump behind the payload of the current option
    i += len;
  }
  
  return ret;
  
}

var toBuffer = function(data) {
  var buffer = [], pos = 0;
  buffer[pos++] = data.op;
  buffer[pos++] = data.htype;
  buffer[pos++] = data.hlen;
  buffer[pos++] = data.hops;
  
  utils.writeInt32(buffer, data.xid, pos); pos += 4;
  utils.writeInt16(buffer, data.secs, pos); pos += 2;
  utils.writeInt16(buffer, data.flags, pos); pos += 2;
  
  ['ciaddr', 'yiaddr', 'siaddr', 'giaddr'].forEach(function(key) {
    (data[key] || '0.0.0.0').split('.').forEach(function(item) {
      buffer[pos++] = parseInt(item);
    });
  });
  
  data.chaddr.split(':').forEach(function(item) {
    buffer[pos++] = parseInt(item, 16);
  });
  
  // fill bootp range with zeros
  // for (; pos<64; pos++) buffer[pos] = 0;
  // for (; pos<64+128; pos++) buffer[pos] = 0;
  while (pos<236) buffer[pos++] = 0;
  
  // magic cookie
  buffer[pos++] = 99;
  buffer[pos++] = 130;
  buffer[pos++] = 83;
  buffer[pos++] = 99;
  
  // dhcp options payload starts at byte 240
  pos = 240;
  for (var opt in data.options) {
    var value = data.options[opt],
        encoder = optionEncoders[opt] || optionEncoders.fallback;
    // console.log(opt, value, encoder);
    pos = converters(opt).encode(buffer, opt, value, pos);
    // pos = encoder.call(encoder, buffer, opt, value, pos);
  }
  
  // mark the packet's end with 0xff
  buffer[pos] = 255;
  
  // return a node buffer
  return new Buffer(buffer, 'ascii');
}

module.exports = {
  "fromBuffer": fromBuffer,
  "toBuffer": toBuffer
}