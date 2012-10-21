// Generated by CoffeeScript 1.3.3
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

var Converters, converters, getConverter, registerConverter, stub;

stub = {
  encode: function(buf, num, value, offset) {
    console.error("[node-dhcpd] encoder for option " + num + " not found");
    return offset;
  },
  decode: function(buf) {
    console.error("[node-dhcpd] decoder for option " + num + " not found");
    console.log("  buffer:", buf);
    return null;
  }
};

converters = [];

getConverter = function(i) {
  if (!converters[i]) {
    try {
      converters[i] = require("" + __dirname + "/converters/" + i);
      console.info("[node-dhcpd] converter for option " + i + " loaded");
    } catch (e) {
      return stub;
    }
  }
  return converters[i];
};

registerConverter = function(i, obj) {
  return converters[i] = obj;
};

Converters = (function() {

  function Converters() {}

  Converters.get = getConverter;

  Converters.register = registerConverter;

  return Converters;

})();

module.exports = Converters;