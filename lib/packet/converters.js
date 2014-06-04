/*
Static class to manage the collection
of converters (encoder/decoder)
found in 'packet/converters/'

The object signature for each converter must be:

{
  encode: function(buf, num, value, offset) { return offset; },
  decode: function(buf) { return null; }
}
*/

var stub = {
  encode: function(buf, num, value, offset) {
    //console.error("[node-dhcpd] encoder for option " + num + " not found");
    return offset;
  },
  decode: function(buf) {
    //console.error("[node-dhcpd] decoder for option " + num + " not found");
    console.log("  buffer:", buf);
    return null;
  }
};

var converters = [];

function getConverter (i) {
  if (!converters[i]) {
    try {
      converters[i] = require("" + __dirname + "/converters/" + i);
      console.info("[node-dhcpd] converter for option " + i + " loaded");
    } catch (e) {
      return stub;
    }
  }
  return converters[i];
}

function registerConverter (i, obj) {
  converters[ i ] = obj;
}

function Converters() {}
Converters.get = getConverter;
Converters.register = registerConverter;

module.exports = Converters;
