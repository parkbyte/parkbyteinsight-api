'use strict';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var rootPath = path.normalize(__dirname + '/..'),
  env,
  db,
  port,
  b_port,
  p2p_port;

var packageStr = fs.readFileSync(rootPath + '/package.json');
var version = JSON.parse(packageStr).version;


function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var home = process.env.INSIGHT_DB || (getUserHome() + '/.insight');

//if (process.env.INSIGHT_NETWORK === 'livenet') {
  env = 'livenet';
  db = home;
  port = '54488';
  b_port = '59060';
  p2p_port = '58060';
//} else {
//  env = 'testnet';
//  db = home + '/testnet';
//  port = '3001';
//  b_port = '18332';
//  p2p_port = '18333';
//}
port = parseInt(process.env.INSIGHT_PORT) || port;


switch (process.env.NODE_ENV) {
  case 'production':
    env += '';
    break;
  case 'test':
    env += ' - test environment';
    break;
  default:
    env += ' - development';
    break;
}

var network = process.env.INSIGHT_NETWORK || 'livenet';
var forceRPCsync = 0; //process.env.INSIGHT_FORCE_RPC_SYNC;

var dataDir = process.env.BITCOIND_DATADIR;
var isWin = /^win/.test(process.platform);
var isMac = /^darwin/.test(process.platform);
var isLinux = /^linux/.test(process.platform);
if (!dataDir) {
  if (isWin) dataDir = '%APPDATA%\\ParkByte\\';
  if (isMac) dataDir = process.env.HOME + '/Library/Application Support/ParkByte/';
  if (isLinux) dataDir = process.env.HOME + '/.ParkByte/';
}
dataDir += network === 'testnet' ? 'testnet3' : '';

var safeConfirmations = process.env.INSIGHT_SAFE_CONFIRMATIONS || 6;
var ignoreCache = process.env.INSIGHT_IGNORE_CACHE || 0;


var bitcoindConf = {
  protocol: process.env.BITCOIND_PROTO || 'http',
  user: process.env.BITCOIND_USER || 'pkbrpc',
  pass: process.env.BITCOIND_PASS || 'GsccLgL2A3i6TGh7gSwQ9nB3GvnoJQPWP2i2fWcCcYz4',
  host: process.env.BITCOIND_HOST || '127.0.0.1',
  port: process.env.BITCOIND_PORT || b_port,
  p2pPort: process.env.BITCOIND_P2P_PORT || p2p_port,
  p2pHost: process.env.BITCOIND_P2P_HOST || process.env.BITCOIND_HOST || '127.0.0.1',
  dataDir: dataDir,
  // DO NOT CHANGE THIS!
  disableAgent: true
};

var enableRatelimiter = process.env.ENABLE_RATELIMITER === 'true';
var enableEmailstore = process.env.ENABLE_EMAILSTORE === 'false';
var loggerLevel = process.env.LOGGER_LEVEL || 'info';
var enableHTTPS = process.env.ENABLE_HTTPS === 'false';
var enableCurrencyRates = process.env.ENABLE_CURRENCYRATES === 'false';

if (!fs.existsSync(db)) {
  mkdirp.sync(db);
}

module.exports = {
  enableRatelimiter: enableRatelimiter,
  ratelimiter: require('../plugins/config-ratelimiter.js'),
  enableEmailstore: enableEmailstore,
  enableCurrencyRates: enableCurrencyRates,
  currencyrates: require('../plugins/config-currencyrates'),
  loggerLevel: loggerLevel,
  enableHTTPS: enableHTTPS,
  version: version,
  root: rootPath,
  publicPath: process.env.INSIGHT_PUBLIC_PATH || false,
  appName: 'Insight ' + env,
  apiPrefix: '/api',
  port: port,
  leveldb: db,
  bitcoind: bitcoindConf,
  network: network,
  disableP2pSync: false,
  disableHistoricSync: false,
  poolMatchFile: rootPath + '/etc/minersPoolStrings.json',

  // Time to refresh the currency rate. In minutes
  currencyRefresh: 10,
  keys: {
    segmentio: process.env.INSIGHT_SEGMENTIO_KEY
  },
  safeConfirmations: safeConfirmations, // PLEASE NOTE THAT *FULL RESYNC* IS NEEDED TO CHANGE safeConfirmations
  ignoreCache: ignoreCache,
  forceRPCsync: forceRPCsync,
};
