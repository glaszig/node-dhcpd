module.exports = function(option_number) {
  var converter;
  try {
    converter = require('./'+option_number);
  } catch (e) {
    require('util').debug('Converter for option '+option_number+' not found');
    converter = {
      encode: function(buf, num, value, offset) { return offset; },
      decode: function(buf) { return null; }
    };
  }
  return converter;
}