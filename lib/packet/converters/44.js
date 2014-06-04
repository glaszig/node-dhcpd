/*
option 44: netbios name servers
http://tools.ietf.org/html/rfc2132#section-8.5
*/
var sprintf = require("../../sprintf");
module.exports = {
  decode: function(buf) {
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

  encode: function(buf, num, data, offset) {
    var routers;
    routers = data.split(",");
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
