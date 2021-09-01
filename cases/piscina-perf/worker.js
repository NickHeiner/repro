require('recast');
const createLog = require('nth-log').default;
const fs = require('fs');
// const path = require('path');
// const piscina = require('piscina');

const babel = require('@babel/core');

const log = createLog({name: 'piscina-perf-worker'});

// function generateRandomString(length) {
//   const chars = [];
//   for (let i = 0; i < length; i++) {
//     chars.push(String(Math.random() * length));
//   }
//   return chars.join('');
// }

module.exports = async function(filePath) {
  return log.logPhase({filePath, phase: 'worker', level: 'debug'}, async () => {
    const fileContents = await fs.promises.readFile(filePath, 'utf8');
    const compiled = babel.transformSync(fileContents, {
      presets: ['@babel/preset-env', '@babel/preset-react']
    });
    await fs.promises.writeFile(`${filePath}.built`, compiled.code);
  //   const filePath = path.join(piscina.workerData.generatedDirPath, `${taskId}.txt`);
  //   await fs.promises.writeFile(
  //     filePath, 
  //     generateRandomString(1000)
  //   );

  //   await fs.promises.readFile(filePath, 'utf8');
  // })
  // const iterationLimit = 5 * (10 ** 9);
  // log.logPhase({phase: 'empty for loop', iterationLimit, level: 'info'}, () => {
  //   for (let i = 0; i < iterationLimit; i++) {}
  });
}
