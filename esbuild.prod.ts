import { build, serve, BuildOptions } from 'esbuild';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';

import { BalenaSdkPolyfillPlugin } from './esbuild-balenaSdkPolyfillPlugin';

const buildOptsNode: BuildOptions = {
  entryPoints: ['./src/extension.ts'],
  outfile: './dist/node/extension.js',
  external: ['vscode'],
  platform: 'node',
  target: ['es2018'],
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  minify: true,
  treeShaking: true,
  plugins: [
    BalenaSdkPolyfillPlugin()
  ]
};

const buildOptsWeb: BuildOptions = {
  entryPoints: ['./src/extension.ts'],
  inject: ['./balenaSdkWeb-shim.ts'],
  outfile: './dist/web/extension.js',
  external: ['vscode'],
  platform: 'browser',
  target: ['es2018'],
  format: 'cjs',
  bundle: true,
  sourcemap: false,
  minify: true,
  treeShaking: true,
  plugins: [
    BalenaSdkPolyfillPlugin({
      stream: true,
    }),
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({
      process: true,
    }),
  ],
};

const serveOpts = {
  servedir: './'
};

const flags = process.argv.filter(arg => /--[^=].*/.test(arg));
const enableWatch = (flags.includes('--watch'));

if (enableWatch) {

  buildOptsNode.watch = {
    onRebuild: (error, result) => {
      if (error) { console.error('watch node production build failed:', error); }
      else { console.log('watch node production build succeeded:', result); }
    }
  };

  buildOptsWeb.watch = {
    onRebuild: (error, result) => {
      if (error) { console.error('watch web production build failed:', error); }
      else { console.log('watch web production  build succeeded:', result); }
    }
  };

  serve(serveOpts, {}).then((result) => {
    console.log(`serving extension from "${serveOpts.servedir}" at "http://${result.host}:${result.port}"`);
  });
}

build(buildOptsNode).then(() => enableWatch ? console.log("watching node production build...") : null);
build(buildOptsWeb).then(() => enableWatch ? console.log("watching web production build...") : null);