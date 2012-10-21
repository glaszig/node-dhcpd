module.exports =
	readIP: (buffer, offset) ->
		if 0 == buffer.readUInt8 offset
			undefined
		else
			stop = offset + 4
			(buffer.readUInt8(offset++) while offset <= stop).join '.'

	readMacAddress: (buffer, offset) ->
	  bytes = buffer.slice(offset, offset+buffer[2])
	  ((byte + 0x100).toString(16).substr(-2) for byte in bytes).join ':'