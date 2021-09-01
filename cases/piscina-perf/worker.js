const createLog = require('nth-log').default;

const babel = require('@babel/core');

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function(filePath) {
  return log.logPhase({filePath, phase: 'worker', level: 'debug'}, async () => {
    try {
      babel.loadOptions({
        filename: filePath,
        presets: [['babel-preset-tvui', { modules: false, appName: '' }]],
        cwd: '/Users/nheiner/code/tvui/'
      });
    } catch (e) {
      console.log(e);
      log.info({e}, 'Worker threw error');
    }
  });
}
