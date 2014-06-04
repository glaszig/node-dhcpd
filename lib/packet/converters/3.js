/*
option 3: routers
*/
var sprintf = require("../../sprintf");

module.exports = {
  decode: function decode(buf) {
    var i, numRecords, pos, records;
    numRecords = buf.length / 4;
    pos = 0;
    records = [];
    i = 0;
    while (i < numRecords) {
      records.push(sprintf("%d.%d.%d.%d", buf[pos++], buf[pos++], buf[pos++], buf[pos++]));
      i++;
    }
    return records;
  },

  encode: function encode(buf, num, data, offset) {
    var routers;
    routers = data;
    buf[offset++] = num;
    buf[offset++] = routers.length * 4;
    routers.forEach(function(ip) {
      return ip.split(".").forEach(function(item) {
        buf[offset++] = item;
      });
    });
    return offset;
  }
};
