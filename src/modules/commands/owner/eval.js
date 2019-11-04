const { inspect } = require('util');
const Command = require('../../Command');

const cmd = new Command('eval').export(module);
const rtoken = new RegExp(process.env.token, 'g');

const i = (object, depth = 1) => inspect(object, { depth, maxArrayLength: 5 });

cmd.main({
  dm: true,
  aliases: ['e'],
  label: 'script',
  responseOptional: true,
  
  pre(ctx) {
    return ctx.client.isOwner(ctx.userId);
  },

  cancel(ctx) {
    console.log(
      'hacker',
      ctx.userId,
      ctx.user.toString(),
    );
    console.log(ctx.message.content);
  },

  preRun(_, { script }) {
    return !!script;
  },
}, async (ctx, { script }) => {
  let content;

  // iOS
  script = script.replace(/—/g, '--');
  script = script.replace(/“|”/g, '"');

  try {
    content = await eval(script);
    if (typeof content !== 'string') {
      let inspected = i(content);
      if (inspected.length > 1950) inspected = i(content, 0);

      content = inspected;
    };

    content = content.replace(rtoken, 'ッ');
  } catch (err) { content = err.message; } finally {
    content = content.substring(0, 1950);
    return ctx.editOrReply(`\`\`\`js\n${content}\`\`\``);
  }
});

cmd.sub('reload-commands', {
  dm: true,
  responseOptional: true,

  onBefore(ctx) {
    return ctx.client.isOwner(ctx.userId);
  },
}, async ctx => {
  await ctx.commandClient.clear();
  try {
    await ctx.commandClient.addMultipleIn('./modules/commands', { subdirectories: true });
    ctx.editOrReply(`reloaded ${ctx.commandClient.commands.length} commands`);
  } catch (err) { console.log('failed reload', err.errors) }

});
