const createLog = require('nth-log').default;

const babel = require('@babel/core');

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function(taskId) {
  return log.logPhase({taskId, phase: 'worker', level: 'debug'}, async () => {
    try {
      babel.loadOptions({
        filename: String(taskId),

        // presets: [['babel-preset-tvui', { modules: false, appName: '' }]],

        presets: ['@tvui/babel-preset-react'],
        cwd: '/Users/nheiner/code/tvui/'
      });
    } catch (e) {
      console.log(e);
      log.info({e}, 'Worker threw error');
    }
  });
}

/dev/urandom perl -CO -ne '
    BEGIN{$/=\4}
    no warnings "utf8";
    print chr(unpack("L>",$_) & 0x7fffffff)'