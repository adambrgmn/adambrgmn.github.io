/* eslint-disable import/no-extraneous-dependencies */

const cp = require('child_process');
const path = require('path');
const { Writable } = require('stream');
const gutil = require('gulp-util');

const PLUGIN_NAME = 'gulp-hugo';

const formatHugoOutput = appendErrors => new Writable({
  write(chunk, encoding, callback) {
    const string = chunk.toString()
      .replace(/ERROR/g, gutil.colors.red('ERROR'))
      .replace(/WARN/g, gutil.colors.yellow('WARN'))
      .replace(/INFO/g, gutil.colors.blue('INFO'));

    const err = chunk.toString()
      .split('\n')
      .filter(l => l.includes('ERROR'));

    appendErrors(...err);

    console.log(string);
    callback();
  },
});

const constructArgs = (opts) => {
  const flags = {
    buildDrafts: ['-D'],
    buildExpired: ['-E'],
    buildFuture: ['-F'],
    dest: ['-d', path.resolve(opts.dest || 'dist')],
    src: ['-s', path.resolve(opts.src || '')],
  };

  return Object.keys(opts).reduce((acc, key) => {
    if (!opts[key] || !flags[key]) return acc;
    return [...acc, ...flags[key], '-v'];
  }, []);
};

module.exports = (opts = {}) => {
  const processArgs = constructArgs(opts);

  return function hugo(cb) {
    const hugoProcess = cp.spawn(
      opts.bin || 'hugo',
      processArgs// eslint-disable-line comma-dangle
    );

    const errors = [];
    const appendErrors = errors.push.bind(errors);

    const output = formatHugoOutput(appendErrors);
    hugoProcess.stdout.pipe(output);

    hugoProcess.on('close', () => {
      if (errors.length > 0) {
        const errMessage = 'Couldn\'t build Hugo source since errors occured:';
        const formattedErrors = errors
          .map(err => err.replace('ERROR', gutil.colors.red('ERROR')));

        if (opts.noThrow) {
          console.log(gutil.colors.grey('---------------'));
          gutil.log(PLUGIN_NAME, gutil.colors.red(errMessage));
          console.log(formattedErrors.join('\n'));
          console.log(gutil.colors.grey('---------------'));
        } else {
          const error = new Error(errMessage);
          error.stack = formattedErrors.join('\n');

          cb(new gutil.PluginError(PLUGIN_NAME, error, { showStack: true }));
          return;
        }
      }

      cb();
    });
  };
};
