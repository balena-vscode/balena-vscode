//@ts-check

'use strict';

const { resolve } = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'node', 
	mode: 'none',
  entry: './src/extension.ts',
  output: {
    path: resolve(__dirname, 'dist', 'node'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      "@": resolve(__dirname, 'src/')
    }
  },
  module: {
    rules: [
      {
        // Without this null loader, source maps, markdown, 
        // and LICENSE files throw errors for the Balena SDK module
        test: /\.(md|map|tar|bak)$|LICENSE/,
        loader: 'null-loader',
      },
      {
        test: /\.(ts|js)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'esnext'
        }
      }
    ]
  },
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'esnext'
      })
    ]
  }
};
module.exports = [ extensionConfig ];