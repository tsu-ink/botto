const { CommandClient } = require('detritus-client');

const commands = new CommandClient(process.env.token, {
  prefix: '`',
  mentionsEnabled: true,
  activateOnEdits: true,
  useClusterClient: true,
  maxEditDuration: 5_00_000,

  ratelimits: [
    { limit: 4, duration: 5_000, type: 'guild' },
    { limit: 2, duration: 1_800, type: 'channel' },
  ],

  gateway: {
    loadAllMembers: true,

    identifyProperties: {
      $browser: 'Discord iOS',
    },

    presence: {
      status: 'online',
      activity: {
        type: 3,
        name: 'my neighbors',
      },
    },
  },
});

(async () => {
  const { client: cluster } = commands;
  const { manager, shardEnd: end, shardStart: start } = cluster;
  process.title += `TSU C|${manager.clusterId} S|${start}-${end}`;

  cluster.on('shard', ({ shard: { gateway, shardId: id } }) => {
    console.log('init shard', id);
    gateway.on('state', ({ state }) => console.log('shard', id, state));
    gateway.on('close', ({ code, reason }) => console.log('shard close', id, code, reason));
  });

  await commands.addMultipleIn('./modules/commands', { subdirectories: true }).catch(err => {
    console.error('loading err', err.errors);
    throw new Error('failed to load commands');
  });

  try {
    await commands.run();
    console.log(`C|${manager.clusterId}`, `S|${cluster.shards.map(s => s.shardId).join(' ')}`);
  } catch (err) {
    console.error(err);
  }
})();
