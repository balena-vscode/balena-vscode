//@ts-check

'use strict';

const { resolve } = require('path');
const { ESBuildMinifyPlugin } = require('esbuild-loader');
const { ProvidePlugin } = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');


//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
const extensionConfig = {
  target: 'webworker', 
	mode: 'none', 
  entry: './src/extension.ts', 
  output: {
    path: resolve(__dirname, 'dist', 'web'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode',
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.js'],
    alias: {
      "@": resolve(__dirname, 'src/')
    },
    fallback: {
      fs: false,
      path: false,
    }
  },
  module: {
    rules: [
      {
        // Without this null loader, source maps, markdown, 
        // and LICENSE files throw errors for the Balena SDK module
        test: /\.(md|map)$|LICENSE/,
        loader: 'null-loader',
      },
      {
        test: /\.(ts|js)$/,
        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
          target: 'es2015'
        }
      }
    ]
  },
  plugins: [
    new NodePolyfillPlugin(),
    new ProvidePlugin({
      process: 'process/browser', // provide a shim for the global `process` variable
      window: 'null-loader' // shim the window object in vscode browser mode so Balena SDK detects its not in a nodejs env
    }),
  ],
  devtool: 'nosources-source-map',
  infrastructureLogging: {
    level: "log",
  },
  optimization: {
    minimizer: [
      new ESBuildMinifyPlugin({
        target: 'es2015',
        treeShaking: true,
        minify: true
      })
    ]
  }
};
module.exports = [ extensionConfig ];