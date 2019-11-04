const { ClusterManager } = require('detritus-client');

new ClusterManager('./src/index.js', process.env.token, {
  respawn: true,
  shardCount: 24,
  shardsPerCluster: 6,
}).run();
