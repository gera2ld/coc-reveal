const fs = require('fs');
const {
  defaultOptions,
  getRollupExternal,
  getRollupPlugins,
  loadConfigSync,
} = require('@gera2ld/plaid');
const pkg = require('./package.json');

const template = fs.readFileSync('src/template.html', 'utf8');
const replaceValues = {
  'process.env.TEMPLATE': JSON.stringify(template),
};

const DIST = defaultOptions.distDir;
const FILENAME = 'index';
const BANNER = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;

const external = [
  ...require('module').builtinModules,
  ...Object.keys(pkg.dependencies),
  'coc.nvim',
];
const bundleOptions = {
  extend: true,
  esModule: false,
};
const postcssConfig = loadConfigSync('postcss') || require('@gera2ld/plaid/config/postcssrc');
const postcssOptions = {
  ...postcssConfig,
  inject: false,
};
const rollupConfig = [
  {
    input: {
      input: 'src/index.ts',
      plugins: getRollupPlugins({
        extensions: defaultOptions.extensions,
        postcss: postcssOptions,
        replaceValues,
      }),
      external,
    },
    output: {
      format: 'cjs',
      file: `${DIST}/${FILENAME}.common.js`,
    },
  },
];

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    // If set to false, circular dependencies and live bindings for external imports won't work
    externalLiveBindings: false,
    ...item.output,
    ...BANNER && {
      banner: BANNER,
    },
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
