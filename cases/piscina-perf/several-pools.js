const { performance } = require('perf_hooks');
const Piscina = require('piscina');
const yargs = require('yargs');
const createLog = require('nth-log').default;
const prettyMs = require('pretty-ms');
const _ = require('lodash');
require('hard-rejection/register');

const {argv} = yargs.options({
  poolIterations: {
    alias: 'i',
    type: 'number',
    default: 4
  },
  taskCount: {
    alias: 'c',
    type: 'number',
    default: 10_000
  },
  destroyBetweenRuns: {
    alias: 'd',
    type: 'boolean',
    default: true
  },
  workerType: {
    alias: 'w',
    type: 'string',
    choices: ['shell', 'babel', 'bigRequire'],
    default: 'shell'
  }
})

const log = createLog({name: 'piscina-perf-parent'});

async function spawnAndUsePool() {
  const workerFileName = {
    shell: './worker-shell',
    babel: './worker-babel',
    bigRequire: './worker-big-require',
  }

  const piscina = new Piscina({
    filename: require.resolve(workerFileName[argv.workerType]),
    argv: [],
    workerData: {}
  });
  
  const runPromises = [];

  const perfMarkStart = 'start enqueing tasks';

  const enqueueStartTimeMs = Date.now();
  const logTimeToFirstReturn = _.once(() => {
    const timeToChangeFirstFile = Date.now() - enqueueStartTimeMs;
    performance.measure('Time to first worker completion', perfMarkStart);
    log.info({
      durationMs: timeToChangeFirstFile,
      durationMsPretty: prettyMs(timeToChangeFirstFile)
    }, 'The first codemod worker to return has done so.');
  });
  performance.mark(perfMarkStart);
  log.logPhase({phase: 'enqueing tasks', level: 'info'}, (_logProgress, setAdditionalLogData) => {
    for (let i = 0; i < argv.taskCount; i++) {
      runPromises.push(new Promise(async resolve => {
        await piscina.run(i);
        logTimeToFirstReturn();
        resolve();
      }));
      setAdditionalLogData({taskCount: runPromises.length});
    }
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
  for (let i = 0; i < argv.poolIterations; i++) {
    await log.logPhase({phase: 'spawning and using the pool', iteration: i, level: 'info'}, spawnAndUsePool);  
  }
}

main();