/*
	This example will only offer IP-Addresses to clients
	with a specific MAC
  
  HINT: Untested
*/

const dhcpd = require('../lib/server.js');

const config = {
	// IP of the machine this script is running on
	"serverip": "192.168.0.5",
	// Subnetmask
	"subnet": "255.255.255.0",
	// Broadcast-Address
	"broadcast": "192.168.0.255",
	// A list of DNS servers
	"nameservers": [
		"8.8.8.8",
		"8.8.4.4"
	],
	// Gateway
	"gateway": "192.168.0.1",
	// Routers
	"routers": [
		
	],
	// A list of clients and the IP-Addresses they should get
	"clients": {
		"00:00:00:00:00:00": {
			"ip": "192.168.0.100",
			"xid": -1
		}
	},
	"leastime": 3600
};

var server = new DHCPServer('udp4', {boradcast: config.broadcast});

/*
	A client sends a DISCOVERY-packet.
	We will only answer to known clients.
*/
server.on('discover', function(packet, ip) {
	// Inspect this packet
	console.log(JSON.stringify(packet));
	
	// Check if he is known to us
	if(typeof config.clients[packet.chaddr] == "undefined") return;
	
	server.offer(packet, {
		// His current IP
		ciaddr: ip ? ip : '0.0.0.0',
		// The IP we want to offer him
		yiaddr: config.clients[packet.chaddr].ip,
		// IP of this server
		siaddr: config.serverip,
		// IP of the gateway
		giaddr: config.gateway,
		// List of routers
		routers: config.routers.join(","),
		options: {
			// Subnetmask
			1:	config.subnet,
			// Routers
			3:	config.routers,
			// DNS-servers
			6:	config.nameservers,
			// Broadcast-address
			28:	self.config.broadcast,
			// Lease-Time
			51:	config.leasetime
		}
	});
	
	config.clients[packet.chaddr].xid = packet.xid;
});

server.on('request', function(packet, ip) {
	// Inspect this packet
	console.log(JSON.stringify(packet));
	
	// Check if he is known to us
	if(typeof config.clients[packet.chaddr] == "undefined") return;
	
	// Because his IP will be static, we will always answer with the same packet - only if we ACK or NAK changes
	var response = {
		ciaddr: ip ? ip : '0.0.0.0',
		yiaddr: config.clients[packet.chaddr].ip,
		siaddr: config.serverip,
		giaddr: config.gateway,
		routers: config.routers.join(","),
		options: {
			1:	config.subnet,
			3:	config.routers,
			6:	config.nameservers,
			28:	self.config.broadcast,
			51:	config.leasetime
		}
	};
	
	// Check if he answers to the last send package
	if(packet.xid != config.clients[packet.chaddr].xid)
		// It wasn't - NAK his request
		return server.nak(packet, response);
	
	// "Allow" him to use this IP
	return server.ack(packet, response);
});
