# Node.js DHCP server

A DHCP (server) implementation purely written in JavaScript.

> This is a proof of concept which basically works but needs more polishing.

## Requirements

node.js 0.8.x

## Installation

Clone this into your `node_modules` folder.

## Usage

```js
var dhcpd = require('node-dhcpd');
var server = dhcpd.createServer('udp4');
```

For an example see `demo/server.js`.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

# License

Published under the [MIT license](http://opensource.org/licenses/MIT).
