const fs = require('fs')
const path = require('path')

const appRoot = path.resolve(__dirname, '..')
const webpackDir = path.join(appRoot, 'node_modules', 'next', 'dist', 'compiled', 'webpack')
const shimPath = path.join(webpackDir, 'LimitChunkCountPlugin.js')
const shimContents = "module.exports = require('./webpack.js').LimitChunkCountPlugin\n"

function ensureWebpackShim() {
  if (!fs.existsSync(webpackDir)) {
    return
  }

  if (!fs.existsSync(shimPath) || fs.readFileSync(shimPath, 'utf8') !== shimContents) {
    fs.writeFileSync(shimPath, shimContents, 'utf8')
  }
}

ensureWebpackShim()
