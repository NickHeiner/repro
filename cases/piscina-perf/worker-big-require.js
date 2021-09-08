const createLog = require('nth-log').default;

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function(taskId) {
  return log.logPhase({taskId, phase: 'worker', level: 'debug'}, async () => {
    require('./big')
  });
}
