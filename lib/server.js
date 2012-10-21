var util = require('util'),
    dhcp = require('./index.js'),
    dgram = require('dgram');

// constructor
var Server = function() {
  dgram.Socket.apply(this, arguments);
  
  // enable broadcasts
  // this.setBroadcast(true);
  
  var dummyCallback = function () { return {}; }
  this.discoverCallback = dummyCallback;
  this.requestCallback = dummyCallback;
  this.declineCallback = dummyCallback;
  this.releaseCallback = dummyCallback;
  this.informCallback = dummyCallback;
  
  var self = this;
  // handle incoming packets
  self.on('message', function(buffer, remote) {
    
    var packet = dhcp.Packet.fromBuffer(buffer);
    if (packet.op == 1) {
      
      var type_id = packet.options[53] || 0,
          type_descr = dhcp.MessageTypes[type_id];
          
      util.log('Got '+type_descr+' from '+remote.address+':'+remote.port+' ('+packet.chaddr+') ' +
        'with packet length of '+buffer.length+' bytes');

      switch (parseInt(type_id)) {
        case 1: self._emitMessage('discover', packet); break; // discover, send offer
        case 3: self._emitMessage('request', packet); break; // request, send ack
        case 4: self._emitMessage('decline', packet); break; // decline, notify admin
        case 7: self._emitMessage('release', packet); break; // release, release ip address, keep record
        case 8: self._emitMessage('inform', packet); break; // inform, send ack to ciaddr, without yiaddr/lease time
      }
      
    } else {
      console.log('  Unsupported message format');
    }
    
  });
  
  // process.on('uncaughtException', function(err) {
  //   require('util').debug('Uncaught Exception: ' + err);
  // });

};
util.inherits(Server, dgram.Socket);

Server.prototype.bind = function(port, host) {
  host = host || '0.0.0.0';
  var res = this.constructor.super_.prototype.bind.call(this, port, host);
  this.setBroadcast(true);
  return res;
}

// sends a packet via Socket.send() to ip an emits eventType
Server.prototype._send = function(eventType, ip, packet) {
  var self = this, buffer = dhcp.Packet.toBuffer(packet);
  util.log("Sending "+dhcp.MessageTypes[packet.options[53]]+" to "+ip+":68 ("+packet.chaddr+") "+
    "with packet lenth of "+buffer.length+" bytes");
  this.emit(eventType, packet);
  this.send(buffer, 0, buffer.length, 68, ip, function(err, bytes) {
    if (err) 
      self.emit(eventType+'Error', err, packet);
    else 
      self.emit(eventType+'Sent', bytes, packet);
  });
}

// call message callbacks to retreive params
// build a dgram packet and send it to the client
Server.prototype._emitMessage = function(messageType, packet) {
  this.emit(messageType, packet, packet.options[50] || null);
};

Server.prototype.offer = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
  
    // set options
    packet.options = params.options;
  }
  
  // ensure response message type
  packet.op = 2;
  packet.options[53] = 2;
  this._send('offer', '255.255.255.255', packet);
};
Server.prototype.ack = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
  
    // set options
    packet.options = params.options;
  }
  
  // ensure response message type
  packet.op = 2;
  packet.options[53] = 5;
  this._send('ack', '255.255.255.255', packet);
};
Server.prototype.nak = function(packet, params) {
  packet.op = 2;
  packet.options[53] = 6;
  this._send('nak', packet.ciaddr, packet);
}
Server.prototype.inform = function(packet, params) {
  if (params) {
    packet.yiaddr = params.yiaddr;
    packet.siaddr = params.siaddr;
  
    // set options
    packet.options = params.options;
  }
  
  // ensure response message type
  packet.op = 2;
  packet.options[53] = 5;
  this._send('inform', packet.ciaddr, packet);
};

module.exports = {
  createServer: function(type) {
    return new Server(type);
  },
  Server: Server,
  Packet: dhcp.Packet
}
