###
Static class to manage the collection 
of converters (encoder/decoder)
found in 'packet/converters/'

The object signature for each converter must be:

{
  encode: function(buf, num, value, offset) { return offset; },
  decode: function(buf) { return null; }
}
###

stub =
  encode: (buf, num, value, offset) ->
		console.error "[node-dhcpd] encoder for option #{num} not found"
		offset
  decode: (buf) ->
		console.error "[node-dhcpd] decoder for option #{num} not found"
		console.log "  buffer:", buf
		null

converters = []

getConverter = (i) ->
	unless converters[i]
		try
			converters[i] = require "#{__dirname}/converters/#{i}"
			console.info "[node-dhcpd] converter for option #{i} loaded"
		catch e
			return stub
	converters[i]

registerConverter = (i, obj) ->
	converters[i] = obj

class Converters
	@get: getConverter
	@register: registerConverter

module.exports = Converters
