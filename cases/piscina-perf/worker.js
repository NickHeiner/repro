const createLog = require('nth-log').default;
const fs = require('fs');

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function() {
  // const iterationLimit = 5 * (10 ** 9);
  // log.logPhase({phase: 'empty for loop', iterationLimit, level: 'info'}, () => {
  //   for (let i = 0; i < iterationLimit; i++) {}
  // });
  await fs.promises.readFile('./package.json', 'utf8')
}
