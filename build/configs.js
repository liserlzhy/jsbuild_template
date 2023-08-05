const path = require('path')
const ts = require('rollup-plugin-typescript2')
const cjs = require('@rollup/plugin-commonjs')
const node = require('@rollup/plugin-node-resolve').nodeResolve
const replace = require('@rollup/plugin-replace')
const livereload = require('rollup-plugin-livereload')
const serve = require('rollup-plugin-server')
const { version = '', author = '' } = require('../package.json')

const fileName = 'fileName' // fileName.js
const extractName = 'extractName' // window.extractName
const isDev = process.env.ENV === 'dev'
const banner = `/*!
  * ${fileName} v${version}
  * (c) ${new Date().getFullYear()} ${author}
  * @license MIT
  */`

const resolve = (_path) => path.resolve(__dirname, '../', _path)

module.exports = [
  {
    file: resolve(`dist/${fileName}.js`),
    format: 'umd',
    env: 'development',
  },
  {
    file: resolve(`dist/${fileName}.min.js`),
    format: 'umd',
    env: 'production',
  },
]
  // .filter((item) => (isDev ? item.env === 'development' : true))
  .map(genConfig)

function genConfig(opts) {
  const config = {
    input: {
      input: opts.input || resolve('src/index.ts'),
      plugins: [
        ts(),
        node(),
        cjs(),
        replace({
          __VERSION__: version,
          __DEV__: JSON.stringify(opts.env === 'development'),
          preventAssignment: true,
        }),
      ],
    },
    output: {
      file: opts.file,
      format: opts.format,
      banner,
      name: extractName,
    },
  }

  if (opts.env === 'development' && isDev) {
    config.input.plugins.push(livereload(), serve({ open: true, port: 12355 }))
  }

  return config
}
