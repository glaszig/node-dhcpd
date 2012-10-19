var utils = require('./utils'),
    sprintf = require('./../support/sprintf');
    
var dhcp = {
  message_types: require('./message_types'),
  options: require('./options')
};

var writeTimeOffset = function(buf, num, offsetHours, offset) {
  // http://www.cisco.com/en/US/tech/tk86/tk804/technologies_tech_note09186a0080093d76.shtml
  /*
  var secs = global.HOUR * offsetHours;
  if (secs < 0) Math.pow(2, 32) + secs;
  var hex = sprintf('%08X', secs);
  */
  buf[offset++] = 0;
  return offset;
}

var writeIp = function(buf, num, ip, offset) {
  buf[offset++] = num;
  buf[offset++] = 4;
  ip.split('.').forEach(function(item) {
    buf[offset++] = item;
  });
  return offset;
}

var writeString = function (buf, num, hostname, offset) {
  var charArr = hostname.split('');
  buf[offset++] = num;
  buf[offset++] = charArr.length;
  charArr.forEach(function (chr) {
    buf[offset++] = chr.charCodeAt();
  });
  return offset;
}

module.exports = {
  fallback: function(buf, num, data, offset) { 
    buf[offset++] = num;
    buf[offset++] = 1;
    buf[offset++] = data;
    return offset; 
  },
  1: writeIp,
  2: writeTimeOffset,
  3: function(buf, num, routers, offset) {
    routers = routers.split(',');
    buf[offset++] = num;
    buf[offset++] = routers.length * 4;
    routers.forEach(function(ip) {
      ip.split('.').forEach(function(item) {
        buf[offset++] = item;
      });
    });
    return offset;
  },
  6: function(buf, num, routers, offset) {
    routers = routers.split(',');
    buf[offset++] = num;
    buf[offset++] = routers.length * 4;
    routers.forEach(function(ip) {
      ip.split('.').forEach(function(item) {
        buf[offset++] = item;
      });
    });
    return offset;
  },
  12: writeString,
  15: writeString,
  51: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 4;
    utils.writeInt32(buf, value, offset);
    return offset+4;
  }
}
