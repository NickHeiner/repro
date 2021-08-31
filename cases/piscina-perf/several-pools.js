const Piscina = require('piscina');
const yargs = require('yargs');
const createLog = require('nth-log').default;
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

async function doBigCompute() {
  const piscina = new Piscina({
    filename: require.resolve('./worker'),
    argv: [],
    workerData: {}
  });
  
  const runPromises = [];
  
  log.logPhase({phase: 'enqueing tasks', taskCount: argv.taskCount, level: 'info'}, () => {
    for (let i = 0; i < argv.taskCount; i++) {
      runPromises.push(piscina.run());
    }
  })

  await log.logPhase({phase: 'waiting for tasks to complete', level: 'info', }, () => Promise.all(runPromises));

  if (argv.destroyBetweenRuns) {
    await log.logPhase({phase: 'destroy pool', level: 'info'}, piscina.destroy.bind(piscina));
  }
}

async function main() {
  for (let i = 0; i < argv.poolIterations; i++) {
    await log.logPhase({phase: 'big compute', iteration: i, level: 'info'}, doBigCompute);  
  }
}

main();