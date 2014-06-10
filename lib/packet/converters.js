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
var utils = require('../utils');
var sprintf = require('../sprintf');

var converters = {
  // option 1: subnet mask
  1: {
    encode: utils.writeIp,
    decode: utils.readIp
  },

  // option 2: time offset
  2: {
    encode: function encode(buf, num, value, offset) {
      buf[offset++] = num;
      buf[offset++] = 4;
      utils.writeInt32(buf, value, offset);
      return offset + 4;
    },
    decode:function decode(buf) {
      return utils.readInt32(buf, 0);
    }
  },

  // option 3: routers
  3: {
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
  },

  // option 6: dns servers
  6: {
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
  },

  /*
  // option 119: dns search list
  119: {
    encode: null,
    decode: null
  },
  */

  // option 12: hostname
  12: {
    encode: utils.writeString,
    decode: utils.readString
  },

  // option 15: dns domain name
  15: {
    encode: utils.writeString,
    decode: utils.readString
  },

  // option 28: broadcast address
  28: {
    encode: utils.writeIp,
    decode: utils.readIp
  },

  // option 31: router discovery
  31: {
    encode: function(buf, num, value, offset) {
      buf[offset++] = num;
      buf[offset++] = 1;
      utils.writeInt8(buf, value, offset);
      return offset + 1;
    },

    decode: function(buf) {
      return utils.readInt8(buf, 0);
    }
  },

  // option 33: static routes
  33: {
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
  },

  // option 44: netbios name servers
  44: {
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
  },

  // option 46: netbios node type
  46: {
    decode: function(buf) {
      return parseInt(buf[0], 16);
    },
    encode: function(buf, num, value, offset) {
      buf[offset++] = num;
      buf[offset++] = 1;
      buf[offset++] = parseInt(buf[0], 10).toString(16);
      return offset;
    }
  },

  // option 47: netbios node type
  47: {
    encode: utils.writeString,
    decode: utils.readString
  },

  // option 50: requested ip address
  50: {
    encode: utils.writeIp,
    decode: utils.readIp
  },

  // option 51: lease time
  51: {
    decode: function(buf) {
      return utils.readInt32(buf, 0);
    },

    encode: function(buf, num, value, offset) {
      buf[offset++] = num;
      buf[offset++] = 4;
      utils.writeInt32(buf, value, offset);
      return offset + 4;
    }
  },

  // option 53: message type
  53: {
    decode: function(buf) {
      return parseInt(buf[0], 10);
    },
    encode: function(buf, num, value, offset) {
      buf[offset++] = 53;
      buf[offset++] = 1;
      buf[offset++] = value;
      return offset;
    }
  },

  // option 55: parameter request list
  55: {
    decode: function decode(buf) {
      var records = [];
      var i = 0;
      var len = buf.length;
      while (i < len) {
        records[i] = buf[i];
        i++;
      }
      return records;
    },

    encode: function encode(buf, num, data, offset) {
      buf[offset++] = num;
      buf[offset++] = data.length;
      var i = 0;
      while(i < data.length) {
        utils.writeInt8(buf, data[i], offset);
        i++;
        offset++;
      }
      return offset;
    }
  },

  // option 57: max message size
  57: {
    encode: function(buf, num, value, offset) {
      buf[offset++] = 57;
      buf[offset++] = 2;
      utils.writeInt16(buf, value, offset);
      return offset + 2;
    },

    decode: function(buf) {
      return utils.readInt16(buf, 0);
    }
  },

  // option 61: client identifier
  61: {
    encode: function(buf, num, value, offset) {
      return offset;
    },

    decode: function(buf) {
      var j, s, type;
      s = [];
      type = buf[0];
      j = 1;
      while (j < buf.length) {
        s.push(sprintf("%02d", buf[j]));
        j++;
      }
      return [type, s.join(":")];
    }
  },

  // option 67: bootfile name
  67: {
    encode: utils.writeString,
    decode: utils.readString
  },

  // option 77: user class information
  77: {
    encode: utils.writeString,
    decode: function(buf) {
      var records = [];
      offset = 0;
      while(buf[offset]){
        var uc_len = buf[offset];
        var uc_data = buf.slice(offset++, uc_len);
        offset += uc_len;
        records.push(uc_data.toString('ascii'));
      }
      return records.join(':');
    }
  },

  // option 83: client fqdn
  83: {
    encode: function(buf, num, value, offset) {
      return offset;
    },

    decode: function(buf) {
      var ret;
      ret = "";
      ret += sprintf("%d", buf[0]) + "-";
      ret += sprintf("%d", buf[1]) + "-";
      ret += sprintf("%d", buf[2]) + " ";
      ret += utils.toString(buf.slice(3));
      return ret;
    }
  },

  // END OF THE LINE... SUCKA
  255: {
    encode: function(buf, num, value, offset){
      utils.writeInt8(buf, 255, offset);
      return offset + 1;
    },
    decode: function(buf) {
      return undefined;
    }
  }
};

var stub = {
  encode: function(buf, num, value, offset) {
    //console.error("[node-dhcpd] encoder for option " + num + " not found");
    return offset;
  },
  decode: function(buf, num) {
    //console.error("[node-dhcpd] decoder for option  " + num + " not found");
    //console.log("  buffer:", buf);
    return null;
  }
};

module.exports = function(i) {
  //console.log("GET CONVERTER FOR " + i);
  return (i in converters) ? converters[i] : stub;
};

