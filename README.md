# Node.js DHCP server

A DHCP (server) implementation purely written in JavaScript.

## Requirements

node.js 0.8.x

## Installation

Clone this into your `node_modules` folder.

## Usage

```js
var dhcpd = require('node-dhcpd');
var server = new dhcpd('udp4', { broadcast: '192.168.0.255' });
```

For a real-world example have a look at [@konobi's forge](https://github.com/konobi/forge/).

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

# License

Published under the [MIT license](http://opensource.org/licenses/MIT).
