class Command {
  constructor(name) {
    this.name = name;
    this.commands = [];
  }

  export(mod) {
    mod.exports = this.commands;

    return this;
  }

  main(opts, fn) {
    this.commands.push({
      name: this.name,
      ...Command.defaultOptions(opts, fn),
    });
  }

  sub(name, opts, fn) {
    this.commands.push({
      name: `${this.name} ${name}`,
      ...Command.defaultOptions(opts, fn),
      priority: 999 - name.split(' ').length,
    });
  }

  static defaultOptions(opts, run) {
    const {
      args = [],
      dm = true,
      aliases = [],
      metadata = {},
      label = 'rest',
      responseOptional = false,
      pre: onBefore = () => true,
      cancel: onCancel = () => null,
      preRun: onBeforeRun = () => true,
      cancelRun: onCancelRun = () => null,
      ratelimits = [
        { limit: 4, duration: 5_000, type: 'guild' },
        { limit: 2, duration: 1_800, type: 'channel' },
      ],
    } = opts;
    return {
      run,
      args,
      label,
      aliases,
      metadata,
      onBefore,
      onCancel,
      ratelimits,
      onBeforeRun,
      onCancelRun,
      disableDm: !dm,
      responseOptional,
    };
  }
}

module.exports = Command;
