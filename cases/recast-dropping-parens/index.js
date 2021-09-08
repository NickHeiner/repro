const babel = require('@babel/core');
const recast = require('recast');
const _ = require('lodash');

const getBabelOpts = (plugins = []) => ({
  filename: 'my-file-name.js',
  plugins,
  ast: true
});

const parser = {
  parse(source, opts) {
    const babelOpts = {
      ...getBabelOpts(),
      // There are options that are recognized by recast but not babel. Babel errors when they're passed. To avoid
      // this, we'll omit them.
      ..._.omit(
        opts,
        'jsx', 'loc', 'locations', 'range', 'comment', 'onComment', 'tolerant', 'ecmaVersion'
      ),
      /**
       * We must have babel emit tokens. Otherwise, recast will use esprima to tokenize, which won't have the
       * user-provided babel config.
       *
       * https://github.com/benjamn/recast/issues/834
       */
      parserOpts: {
        tokens: true
      }
    };
    return babel.parse(source, babelOpts);
  }
};

const fileContents = `
jest.mock('./my-module', () => () => ({
  mockedFn: jest.fn()
})); 
`

const ast = recast.parse(fileContents, {parser});

const setAst = () => ({
  visitor: {
    Program(path) {
      path.replaceWith(ast.program);
    }
  }
});

const plugin = ({ types: t }) => ({
  visitor: {
    ArrowFunctionExpression(astPath) {
      const getWrappedValue = (originalValue) =>
        t.callExpression(t.identifier("wrapped"), [
          originalValue
        ]);

      const bodyPath = astPath.get("body");
      bodyPath.replaceWith(getWrappedValue(bodyPath.node));
      astPath.skip();
    }
  }
});

const result = babel.transformSync('', getBabelOpts([setAst, plugin]));

console.log(`
Babel result
${result.code}

Recast result
${recast.print(result.ast)}
`)