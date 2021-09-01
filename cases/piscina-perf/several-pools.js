const Piscina = require('piscina');
const yargs = require('yargs');
const createLog = require('nth-log').default;
const prettyMs = require('pretty-ms');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const globby = require('globby');
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

const inputFilePaths = globby.sync('packages/**/*.js', {dot: true, gitignore: true, cwd: '/Users/nheiner/code/tvui/', absolute: true});

// log.info({inputFilePaths: inputFilePaths.slice(0, 10)});
// return;

async function spawnAndUsePool() {
  const piscina = new Piscina({
    filename: require.resolve('./worker'),
    argv: [],
    workerData: {generatedDirPath}
  });
  
  const runPromises = [];

  const enqueueStartTimeMs = Date.now();
  const logTimeToFirstReturn = _.once(() => {
    const timeToChangeFirstFile = Date.now() - enqueueStartTimeMs;
    log.info({
      durationMs: timeToChangeFirstFile,
      durationMsPretty: prettyMs(timeToChangeFirstFile)
    }, 'The first codemod worker to return has done so.');
  });
  log.logPhase({phase: 'enqueing tasks', level: 'info'}, (_logProgress, setAdditionalLogData) => {
    // for (let i = 0; i < argv.taskCount; i++) {
    for (const inputFilePath of inputFilePaths) {
      runPromises.push(new Promise(async resolve => {
        await piscina.runTask(inputFilePath);
        logTimeToFirstReturn();
        resolve();
      }));
      setAdditionalLogData({taskCount: runPromises.length});
    }
    // }
  })

  // I observe completed = 9975, even when I pass 10,000 tasks. I'm not sure why that is. I see that 10k tasks actually
  // executed.
  piscina.on('drain', () => {
    log.info(_.pick(piscina, 'runTime', 'waitTime', 'duration', 'completed', 'utilization'), 'Piscina pool drained.');
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