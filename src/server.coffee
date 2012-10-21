util = require 'util'
dhcp = require './index'
{Socket} = require 'dgram'

class DHCPServer extends Socket
	constructor: ->
		super

		this.on 'message', (buffer, remote) =>
			packet = dhcp.Packet.fromBuffer buffer

			if packet.op == 1
				type =
					id: packet.options[53] || 0
					name: dhcp.MessageTypes[(packet.options[53] || 0)]

				util.log "Got #{type.name} from" +
					" #{remote.address}:#{remote.port} (#{packet.chaddr}) " +
					" with packet length of #{buffer.length} bytes"

				event_name = type.name.replace('DHCP', '').toLowerCase()
				@_emitPacket event_name, packet
			else
				console.log "  Unsupported message format"

	bind: ->
		res = super
		@setBroadcast true
		res

	_send: (event_name, ip, packet) ->
		buffer = packet.toBuffer()
		util.log "Sending #{dhcp.MessageTypes[packet.options[53]]}" +
		  " to #{ip}:68 (#{packet.chaddr})" +
		  " with packet length of #{buffer.length} bytes"

		@emit event_name, packet
		@send buffer, 0, buffer.length, 68, ip, (err, bytes) =>
			if err
				@emit "#{event_name}Error", err, packet
			else
				@emit "#{event_name}Sent", bytes, packet

	_emitPacket: (message_type, packet) ->
		@emit message_type, packet, packet.options[50] || null

	offer: (packet, params) ->
		if params
			packet.yiaddr = params.yiaddr
			packet.siaddr = params.siaddr
			packet.options = params.options

		packet.op = packet.options[53] = 2
		@_send 'offer', '255.255.255.255', packet

	ack: (packet, params) ->
		if params
			packet.yiaddr = params.yiaddr
			packet.siaddr = params.siaddr
			packet.options = params.options

		packet.op = 2
		packet.options[53] = 5
		@_send 'ack', '255.255.255.255', packet

	nak: (packet, params) ->
		packet.op = 2
		packet.options[53] = 6
		@_send 'nak', packet.ciaddr, packet

	inform: (packet, params) ->
		if params
			packet.yiaddr = params.yiaddr
			packet.siaddr = params.siaddr
			packet.options = params.options

		packet.op = 2
		packet.options[53] = 5
		@_send 'inform', packet.ciaddr, packet

	discoverCallback: ->
	requestCallback: ->
	declineCallback: ->
	releaseCallback: ->
	informCallback: ->

module.exports = 
	createServer: (type) ->
		new DHCPServer type
	Server: DHCPServer
	Packet: dhcp.Packet
