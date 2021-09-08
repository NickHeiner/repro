const createLog = require('nth-log').default;

const babel = require('@babel/core');

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function(taskId) {
  return log.logPhase({taskId, phase: 'worker', level: 'debug'}, async () => {
    try {
      babel.loadOptions({
        filename: String(taskId),

        // Average time to first task completed: ~30s.
        // presets: [['babel-preset-tvui', { modules: false, appName: '' }]],
        
        // Average time to first task completed: ~10s.
        presets: ['@tvui/babel-preset-react'],
        cwd: '/Users/nheiner/code/tvui/'
      });
    } catch (e) {
      console.log(e);
      log.info({e}, 'Worker threw error');
    }
  });
}
