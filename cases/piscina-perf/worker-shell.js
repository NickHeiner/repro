const createLog = require('nth-log').default;

const execa = require('execa');
const gitRoot = require('git-root');

const log = createLog({name: 'piscina-perf-worker'});

module.exports = async function(taskId) {
  return log.logPhase({taskId, phase: 'worker', level: 'debug'}, async () => {
    // execa.sync('git', ['rev-parse', '--show-toplevel']);
    console.log(gitRoot('/Users/nheiner/code/tvui/tools/@tvui/babel-preset-react/index.js'));
  });
}
