var util = require('util');
var dhcp = require('./index');
var Socket = require('dgram').Socket;


function DHCPServer(type, opts) {
  var _this = this;
  DHCPServer.super_.apply(this, [type]);
  _this.broadcast = opts.broadcast;
  this.on('error', function(err){
    console.dir(err);
  });
  this.on('message', function(buffer, remote) {
    var event_name, packet, type;
    packet = dhcp.Packet.fromBuffer(buffer);
    if (packet.op === 1) {
      type = {
        id: packet.options[53] || 0,
        name: dhcp.MessageTypes[packet.options[53] || 0]
      };
      //util.log(("Got " + type.name + " from") + (" " + remote.address + ":" + remote.port + " (" + packet.chaddr + ") ") + (" with packet length of " + buffer.length + " bytes"));
      event_name = type.name.replace('DHCP', '').toLowerCase();
      return _this._emitPacket(event_name, packet);
    } else {
      return console.log("  Unsupported message format");
    }
  });
  return _this;
}
util.inherits(DHCPServer, Socket);

DHCPServer.prototype.bind = function(port, addr, cb) {
  var self = this;
  var res;
  res = DHCPServer.super_.prototype.bind.call(this, port, addr, function(){
    this.setBroadcast(true);
    if(cb instanceof Function) cb();
  });
  return res;
};

DHCPServer.prototype._send = function(event_name, ip, packet) {
  var buffer,
    _this = this;
  buffer = packet.toBuffer();
  //util.log(("Sending " + dhcp.MessageTypes[packet.options[53]]) + (" to " + ip + ":68 (" + packet.chaddr + ")") + (" with packet length of " + buffer.length + " bytes"));
  this.emit(event_name, packet);
  return this.send(buffer, 0, buffer.length, 68, ip, function(err, bytes) {
    if (err) {
      return _this.emit("" + event_name + "Error", err, packet);
    } else {
      return _this.emit("" + event_name + "Sent", bytes, packet);
    }
  });
};

DHCPServer.prototype._emitPacket = function(message_type, packet) {
  return this.emit(message_type, packet, packet.options[50] || null);
};

DHCPServer.prototype.offer = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
    packet.options = params.options;
  }
  packet.op = packet.options[53] = 2;
  return this._send('offer', this.broadcast, packet);
};

DHCPServer.prototype.ack = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
    packet.options = params.options;
  }
  packet.op = 2;
  packet.options[53] = 5;
  return this._send('ack', this.broadcast, packet);
};

DHCPServer.prototype.nak = function(packet, params) {
  packet.op = 2;
  packet.options[53] = 6;
  return this._send('nak', packet.ciaddr, packet);
};

DHCPServer.prototype.inform = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
    packet.options = params.options;
  }
  packet.op = 2;
  packet.options[53] = 5;
  return this._send('inform', packet.ciaddr, packet);
};

DHCPServer.Packet = dhcp.Packet;
module.exports = DHCPServer;

