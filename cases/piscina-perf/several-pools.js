const Piscina = require('piscina');
const yargs = require('yargs');
const createLog = require('nth-log').default;
const fs = require('fs');
const path = require('path');
require('hard-rejection/register');

const {argv} = yargs.options({
  poolIterations: {
    type: 'number',
    default: 4
  },
  taskCount: {
    type: 'number',
    default: 10_000
  },
  destroyBetweenRuns: {
    type: 'boolean',
    default: true
  }
})

const log = createLog({name: 'piscina-perf-parent'});
const generatedDirPath = path.resolve(__dirname, '__generated__');

async function spawnAndUsePool() {
  const piscina = new Piscina({
    filename: require.resolve('./worker'),
    argv: [],
    workerData: {generatedDirPath}
  });
  
  const runPromises = [];
  
  log.logPhase({phase: 'enqueing tasks', taskCount: argv.taskCount, level: 'info'}, () => {
    for (let i = 0; i < argv.taskCount; i++) {
      runPromises.push(piscina.run(i));
    }
  })

  await log.logPhase({phase: 'waiting for tasks to complete', level: 'info', }, () => Promise.all(runPromises));

  if (argv.destroyBetweenRuns) {
    await log.logPhase({phase: 'destroy pool', level: 'info'}, piscina.destroy.bind(piscina));
  }
}

async function main() {
  await fs.promises.rm(generatedDirPath, {force: true, recursive: true})
  await fs.promises.mkdir(generatedDirPath);
  for (let i = 0; i < argv.poolIterations; i++) {
    await log.logPhase({phase: 'spawning and using the pool', iteration: i, level: 'info'}, spawnAndUsePool);  
  }
}

main();