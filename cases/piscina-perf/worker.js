const createLog = require('nth-log').default;
const fs = require('fs');
const path = require('path');
const piscina = require('piscina');

const log = createLog({name: 'piscina-perf-worker'});

function generateRandomString(length) {
  const chars = [];
  for (let i = 0; i < length; i++) {
    chars.push(String(Math.random() * length));
  }
  return chars.join('');
}

module.exports = async function(taskId) {
  return log.logPhase({taskId, phase: 'worker', level: 'debug'}, async () => {
    await fs.promises.writeFile(
      path.join(piscina.workerData.generatedDirPath, `${taskId}.txt`), 
      generateRandomString(500)
    );
  })
  // const iterationLimit = 5 * (10 ** 9);
  // log.logPhase({phase: 'empty for loop', iterationLimit, level: 'info'}, () => {
  //   for (let i = 0; i < iterationLimit; i++) {}
  // });
}
