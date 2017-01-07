
var utils = require('./utils');

var get_convert = require('./packet/converters');

function Packet(array) {
  var key;
  for (key in array) {
    if(array.hasOwnProperty(key)){
      this[key] = array[key];
    }
  }
}

function stripBinNull(str) {
  var pos;
  pos = str.indexOf('\u0000');
  if (pos === -1) {
    return str;
  } else {
    return str.substr(0, pos);
  }
}

var fromBuffer = function(b) {
  var i, optLen, optNum, optVal, options, ret, _ref;
  ret = {
    op: b[0],
    htype: b[1],
    hlen: b.readUInt8(2),
    hops: b.readUInt8(3),
    xid: b.readUInt32BE(4),
    secs: b.readUInt16BE(8),
    flags: b.readUInt16BE(10),
    ciaddr: utils.readIp(b, 12),
    yiaddr: utils.readIp(b, 16),
    siaddr: utils.readIp(b, 20),
    giaddr: utils.readIp(b, 24),
    chaddr: utils.readMacAddress(b.slice(28, 28 + b.readUInt8(2))),
    sname: stripBinNull(b.toString('ascii', 44, 108)),
    file: stripBinNull(b.toString('ascii', 108, 236)),
    options: {}
  };
  _ref = [0, b.slice(240)]; i = _ref[0]; options = _ref[1];
  while (i < options.length && options[i] !== 255) {
    optNum = parseInt(options[i++], 10);
    optLen = parseInt(options[i++], 10);
    var converter = get_convert(optNum);
    optVal = converter.decode(options.slice(i, i + optLen), optNum);
    ret.options[optNum] = optVal;
    i += optLen;
  }
  return new Packet(ret);
};

var toBuffer = function() {
  var buffer, hex, i, key, octet, opt, padded, pos, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
  buffer = Buffer.alloc(512, 0x00, 'ascii');
  buffer[0] = this.op;
  buffer[1] = this.htype;
  buffer.writeUInt8(this.hlen, 2);
  buffer.writeUInt8(this.hops, 3);
  buffer.writeUInt32BE(this.xid, 4);
  buffer.writeUInt16BE(this.secs, 8);
  buffer.writeUInt16BE(this.flags, 10);
  pos = 12;
  _ref = ["ciaddr", "yiaddr", "siaddr", "giaddr"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    key = _ref[_i];
    _ref1 = (this[key] || "0.0.0.0").split(".");
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      octet = _ref1[_j];
      buffer.writeUInt8(parseInt(octet, 10), pos++);
    }
  }
  _ref2 = this.chaddr.split(':');
  for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
    hex = _ref2[_k];
    buffer[pos++] = parseInt(hex, 16);
  }
  buffer.fill(0, 43, 235);
  buffer.write(this.sname, 43, 64, 'ascii');
  buffer.write(this.fname, 109, 128, 'ascii');
  pos = 236;
  _ref3 = [99, 130, 83, 99];
  for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
    i = _ref3[_l];
    buffer[pos++] = i;
  }
  pos = 240;
  for (opt in this.options) {
    if(this.options.hasOwnProperty(opt)){
      value = this.options[opt];
      var converter = get_convert(opt);
      pos = converter.encode(buffer, opt, value, pos);
    }
  }
  buffer[pos] = 255;
  padded = Buffer.alloc(pos, 0x00, 'ascii');
  buffer.copy(padded, 0, 0, pos);
  return padded;
};

Packet.fromBuffer = fromBuffer;

Packet.prototype.toBuffer = toBuffer;

Packet.prototype.getRequestedIPAddress = function() {
  return this.options[50];
};

Packet.prototype.op = function(op) {
  this.op = op;
  return this;
};

Packet.prototype.htype = function(htype) {
  this.htype = htype;
  return this;
};

Packet.prototype.hlen = function(hlen) {
  this.hlen = hlen;
  return this;
};

Packet.prototype.hops = function(hops) {
  this.hops = hops;
  return this;
};

Packet.prototype.xid = function(xid) {
  this.xid = xid;
  return this;
};

Packet.prototype.secs = function(secs) {
  this.secs = secs;
  return this;
};

Packet.prototype.flags = function(flags) {
  this.flags = flags;
  return this;
};

Packet.prototype.ciaddr = function(ciaddr) {
  this.ciaddr = ciaddr !== null ? ciaddr : '0.0.0.0';
  return this;
};

Packet.prototype.yiaddr = function(yiaddr) {
  this.yiaddr = yiaddr !== null ? yiaddr : '0.0.0.0';
  return this;
};

Packet.prototype.siaddr = function(siaddr) {
  this.siaddr = siaddr !== null ? siaddr : '0.0.0.0';
  return this;
};

Packet.prototype.giaddr = function(giaddr) {
  this.giaddr = giaddr !== null ? giaddr : '0.0.0.0';
  return this;
};

Packet.prototype.chaddr = function(chaddr) {
  this.chaddr = chaddr;
  return this;
};

Packet.prototype.sname = function(sname) {
  this.sname = sname;
  return this;
};

Packet.prototype.file = function(file) {
  this.file = file;
  return this;
};

Packet.prototype.options = function(options) {
  this.options = options;
  return this;
};

module.exports = {
  Packet: Packet,
  fromBuffer: fromBuffer,
  toBuffer: toBuffer
};
