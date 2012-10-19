/**
 * option 33: static routes
 * http://tools.ietf.org/html/rfc2132#section-5.8
 */
var sprintf = require('../../support/sprintf'),
    utils = require('../utils');

function decode(buf) {
  var numRecords = buf.length/4, pos = 0, records = [];
  for (var i=0; i<numRecords; i++) {
    records.push(sprintf('%d.%d.%d.%d', buf[pos++], buf[pos++], buf[pos++], buf[pos++]))
  }
  return records;
}

function encode(buf, num, data, offset) {
  var routers = data.split(',');
  buf[offset++] = num;
  buf[offset++] = routers.length * 4;
  routers.forEach(function(ip) {
    ip.split('.').forEach(function(item) {
      buf[offset++] = item;
    });
  });
  return offset;
}

module.exports = {
  "encode": encode, "decode": decode
}