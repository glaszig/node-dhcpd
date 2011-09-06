var dhcp = require('dhcp'),
    server = dhcp.createServer('udp4'),
    sqlite3 = require('sqlite3'),
    db = new sqlite3.Database(':memory:');
    
var config = {
  listen: ['10.10.10.1']
}

db.serialize(function() {
  db.run('CREATE TABLE requests ('+
    'xid integer,'+
    'req_ip varchar(15),'+
    'created_at text,'+
    'primary key (xid)'+
  ')');
});

server.on('discover', function(packet, ip) {
  // initialization state
  // http://technet.microsoft.com/en-us/library/cc958935.aspx
  ip = ip || '192.168.1.23';
  var q = db.run(
    "INSERT INTO requests (xid, req_ip, created_at) VALUES (?, ?, datetime('now'))",
    packet.xid, ip
  );
  db.each("SELECT xid, req_ip, created_at FROM requests", function(err, row) {
    console.log(row);
  });
  server.offer(packet, {
    yiaddr: ip,
    siaddr: '10.10.10.198',
    options: {
      1: '255.255.255.0',
      3: '192.168.1.1',
      28: '192.168.1.255',
      51: 36400
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
  util.log('  looking up offered ip for xid '+packet.xid);
  db.get('SELECT req_ip FROM requests WHERE xid = ?', packet.xid, function(err, row) {
    if (err) {
      util.log('  '+err);
      // server.nak(packet);
    } else {
      server.ack(packet, {
        yiaddr: row.req_ip,
        siaddr: '10.10.10.198',
        options: {
          1: '255.255.255.0',
          3: '192.168.1.1',
          28: '192.168.1.255',
          51: 36400
        }
      });
    }
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
  var buffer = dhcp.Packet.toBuffer(packet);
  console.log('- offer packet->buffer -', buffer.length, buffer);
  console.log('- offer buffer->packet -', dhcp.Packet.fromBuffer(buffer));
});
server.on('offerError', function(err, packet) {
  console.log('offerError', err, (packet));
});
server.on('offerSent', function(bytes, packet) {
  console.log('offerSent');
});


server.on('ack', function(packet) {
  console.log('- ack -', packet);
  var buffer = dhcp.Packet.toBuffer(packet);
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

server.bind(67);
