var Cylon = require('cylon');
var qt = require('./modules/q-time');
var main = require('./main.js');

Cylon.robot({
  connections: {
    sphero: {adaptor: 'sphero', port: '/dev/tty.Sphero-ROB-AMP-SPP'}
  },

  devices: {
    sphero: {driver: 'sphero'}
  },

  work: main(my)
  
}).start();

