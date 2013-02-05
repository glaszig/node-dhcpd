var fs = require('fs'),
    dhcp = require('./../lib/server'),
    util = require('util'),
    server = dhcp.createServer('udp4'),
    sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database(':memory:');

Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            if (name in dest) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
            }
        });
        return this;
    }
});
    
var config = {
  "leaseTime": 36400,
  "subnets": [{
    "range": ["192.168.56.10", "192.168.56.20"],
    "subnetMask": "255.255.255.0",
    "routers": ["192.168.56.1", "10.10.10.1"],
    "nameServers": ["192.168.56.1", "10.10.10.1", "10.10.20.1"],
    "broadcast": "192.168.56.255"
  }]
};

var applyDefaultsToSubnet = function(subnet) {
  for (var p in config) {
    if (typeof config[p] != 'object' && !subnet[p])
      subnet[p] = config[p];
  }
  return subnet;
}

var findSubnetForIp = function(ip) {
  var returnSubnet = null, re = /\./g;
  ip = parseInt(ip.replace(re, ''));
  
  config.subnets.forEach(function(subnet) {
    var from = parseInt(subnet.range[0].replace(re, '')),
        to = parseInt(subnet.range[1].replace(re, ''));
    if (ip >= from && ip <= to) {
      returnSubnet = subnet;
    }
  });
  
  return returnSubnet ? applyDefaultsToSubnet(returnSubnet) : returnSubnet;
};

var randomIpInRange = function(range) {
  var re = /\./g, rand = function(min, max) {
  	var args = arguments.length;  
  	if (args === 0) {
  		min = 0;
  		max = 32768;
    }
    return Math.floor( Math.random() * (max - min + 1) ) + min;
  },
  min = parseInt(range[0].replace(re, '')),
  max = parseInt(range[1].replace(re, ''));
  max = max - min,
  lastByte = rand(0, max);
  return range[0].replace(/\d+$/, lastByte);
}

console.log(findSubnetForIp('192.168.56.10'));

db.serialize(function() {
  db.run('CREATE TABLE requests ('+
    'xid integer,'+
    'chaddr varchar(255),'+
    'ip_address varchar(15),'+
    'created_at text,'+
    'primary key (xid)'+
  ')');
});

server.on('message', function(data) {
  fs.writeFileSync(__dirname + '/log/request.bin', data);
  // var buf = fs.readFileSync(__dirname + '/log/request.bin');
});

server.on('discover', function(packet, ip) {
  // initialization state
  // http://technet.microsoft.com/en-us/library/cc958935.aspx
  var subnet = config.subnets[0];
  ip = ip || randomIpInRange(subnet.range);
  
  db.serialize(function() {
    db.run(
      "INSERT INTO requests (xid, chaddr, ip_address, created_at) VALUES (?, ?, ?, datetime('now'))",
      packet.xid, packet.chaddr, ip,
      function(err, row) {}
    );
    // db.each("SELECT * FROM requests", function(err, row) {
    //   console.log(row);
    // });
  });
  
  server.offer(packet, {
    yiaddr: ip,
    siaddr: '10.10.20.10',
    options: {
      1: subnet.subnetMask,
      3: subnet.routers,
      28: subnet.broadcast,
      51: subnet.leaseTime
    }
  });
});

server.on('request', function(packet, ip) {
  // in request state, we either acknowledge
  // a lease or send a nak to notify the client
  // we can't serve his lease request.
  // 
  // clients will initiate the rebinding state
  // after 50% of the lease time passed.
  // 
  // http://technet.microsoft.com/en-us/library/cc958935.aspx
  db.serialize(function() {
    // if we'll receive a request from a client
    // which sent a discover before but the xid
    // does not match, discard the offer we sent
    db.run("DELETE FROM requests WHERE chaddr = ? AND xid != ?", packet.chaddr, packet.xid);
  
    // now we move on with serving the request
    db.get('SELECT ip_address FROM requests WHERE xid = ?', packet.xid, function(err, row) {
      // found a matching offer, send ack
      if (row) {
        util.log('  found offered ip ' + row.ip_address + ' for xid ' + packet.xid);
        var subnet = findSubnetForIp(row.ip_address),
            params = {
              yiaddr: row.ip_address,
              siaddr: '10.10.10.198',
              options: {
                1: subnet.subnetMask,
                3: subnet.routers,
                28: subnet.broadcast,
                51: subnet.leaseTime
              }
            };
      } else {
        util.log('  could not find ip for xid ' + packet.xid);
        var subnet = findSubnetForIp(ip);
        if (!subnet) subnet = findSubnetForIp(packet.ciaddr);
        var params = {
          yiaddr: row.ip_address,
          siaddr: '10.10.10.198',
          options: {
            1: subnet.subnetMask,
            3: subnet.routers,
            28: subnet.broadcast,
            51: subnet.leaseTime
          }
        };
      }
      
      server.ack(packet, params);
      
    });
  });
  
});
server.on('decline', function(packet) {
  console.log('- decline -', packet);
});
server.on('release', function(packet) {
  console.log('- release -', packet);
});
server.on('inform', function(packet) {
  console.log('- inform -', packet);
});


server.on('offer', function(packet) {
  console.log('- offer -', packet);
  var buffer = packet.toBuffer();
  console.log('- offer packet->buffer -', buffer.length, buffer);
  console.log('- offer buffer->packet -', dhcp.Packet.fromBuffer(buffer));
});
server.on('offerError', function(e, packet) {
  util.log('OFFER ERROR: '+e.code+': '+e.message);
  // console.log('offerError', err, (packet));
});
server.on('offerSent', function(bytes, packet) {
  console.log('offerSent');
});


server.on('ack', function(packet) {
  console.log('- ack -', packet);
  var buffer = packet.toBuffer();
  console.log('- ack packet->buffer -', buffer.length, buffer);
  console.log('- ack buffer->packet -', dhcp.Packet.fromBuffer(buffer));
});
server.on('ackError', function(err, packet) {
  console.log('ackError', err, (packet));
});
server.on('ackSent', function(bytes, packet) {
  console.log('ackSent');
});


server.on('nak', function() {
  console.log('- nak -');
});
    
server.on("listening", function () {
  var address = server.address();
  console.log("server listening " +
      address.address + ":" + address.port);
});

server.bind(67, process.argv[2]);
