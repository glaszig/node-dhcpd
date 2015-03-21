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

function skipencode(buf, num, value, offset) {
  return offset;
}

var stringconverter = {
  encode: utils.writeString,
  decode: utils.readString
};

var int8converter = {
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 1;
    utils.writeInt8(buf, value, offset);
    return offset + 1;
  },

  decode: function(buf) {
    return utils.readInt8(buf, 0);
  }
};

var ints8converter = {
  decode: function(buf) {
    var num_ints = buf.length, ints = [];
    for (var i = 0; i < num_ints; i++) {
      ints[i] = buf[i];
    }
    return ints;
  },

  encode: function(buf, num, ints, offset) {
    buf[offset++] = num;
    buf[offset++] = ints.length;
    for (var i = 0; i < ints.length; i++) {
      buf[offset++] = ints[i++];
    }
    return offset;
  }
};

var int16converter = {
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 2;
    utils.writeInt16(buf, value, offset);
    return offset + 2;
  },

  decode: function(buf) {
    return utils.readInt16(buf, 0);
  }
};

var ints16converter = {
  encode: utils.writeString,
  decode: utils.readString
  /*
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 2;
    utils.writeInt16(buf, value, offset);
    return offset + 2;
  },

  decode: function(buf) {
    return utils.readInt16(buf, 0);
  }
  */
};

var int32converter = {
  encode: function(buf, num, value, offset) {
    buf[offset++] = num;
    buf[offset++] = 4;
    utils.writeInt32(buf, value, offset);
    return offset + 4;
  },

  decode: function(buf) {
    return utils.readInt32(buf, 0);
  }
};

var ipconverter = {
  encode: utils.writeIp,
  decode: function(buf) { return utils.readIp(buf, 0) }
};

var ipsconverter = {
  decode: function(buf) {
    var num_ips = buf.length / 4, pos = 0, ips = [];
    for (var ip = 0; ip < num_ips; ip++) {
      ips.push(sprintf("%d.%d.%d.%d", buf[pos++], buf[pos++], buf[pos++], buf[pos++]));
    }
    return ips;
  },

  encode: function(buf, num, ips, offset) {
    buf[offset++] = num;
    buf[offset++] = ips.length * 4;
    ips.forEach(function(ip) {
      ip.split(".").forEach(function(octet) {
        buf[offset++] = octet;
      });
    });
    return offset;
  }
};

var ipsconvertercomma = {
  decode: ipsconverter.decode,

  encode: function(buf, num, ips, offset) {
    return ipsconverter.decode(buf, num, ips.split(","), offset);
  }
};

var converters = {
  // option 1: subnet mask
  1: ipconverter,

  // option 2: time offset
  2: int32converter,

  // option 3: routers
  3: ipsconverter,

  // option 6: dns servers
  6: ipsconverter,

  // option 7: log server
  7: ipconverter,

  // option 12: hostname
  12: stringconverter,

  // option 15: dns domain name
  15: stringconverter,

  // option 17: root path
  17: stringconverter,

  // option 26: mtu
  26: int16converter,

  // option 28: broadcast address
  28: ipconverter,

  // option 31: router discovery
  31: int8converter,

  // option 33: static routes
  33: ipsconverter, //ipsconvertercomma

  // option 42: ntp servers
  42: ipsconverter,

  // option 43: vendor specific
  43: stringconverter,

  // option 44: netbios name servers
  44: ipsconverter, //ipsconvertercomma

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
  47: stringconverter,

  // option 50: requested ip address
  50: ipconverter,

  // option 51: lease time
  51: int32converter,

  // option 53: message type
  53: {
    decode: function(buf) {
      return parseInt(buf[0], 10);
    },
    encode: function(buf, num, value, offset) {
      buf[offset++] = num;
      buf[offset++] = 1;
      buf[offset++] = value;
      return offset;
    }
  },

  // option 54: server identifier
  54: ipconverter,

  // option 55: parameter request list
  55: ints8converter,

  // option 57: max message size
  57: int16converter,

  // option 60: vendor clsss identifier
  60: stringconverter, // FIXME http://www.networksorcery.com/enp/protocol/bootp/options.htm

  // option 61: client identifier
  61: {
    encode: skipencode,
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

  // option 66: tftp server name
  66: stringconverter,

  // option 67: bootfile name
  67: stringconverter,

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
    encode: skipencode,

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

  /*
  93: ints16converter,
  94: ints8converter,
  97: stringconverter,
  175: stringconverter,
  */

  /*
  // option 119: dns search list
  119: {
    encode: null,
    decode: null
  },
  */

  // END OF THE LINE... SUCKA
  255: {
    encode: function(buf, num, value, offset){
      buf[offset++] = num;
      return offset;
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

