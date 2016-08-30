import { join } from 'path';
import merge from 'webpack-merge';
import validate from 'webpack-validator';

import * as parts from './webpack';

const TARGET = process.env.npm_lifecycle_event;
const ENABLE_POLLING = process.env.ENABLE_POLLING;
const PATHS = {
  app: join(__dirname, 'src'),
  style: [
    join(__dirname, 'src', 'main.scss'),
  ],
  images: join(__dirname, 'src', 'images'),
  favicon: join(__dirname, 'src'),
  build: join(__dirname, 'build'),
  test: join(__dirname, 'tests'),
};

process.env.BABEL_ENV = TARGET;

const common = merge(
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: PATHS.build,
      filename: '[name].js',
      publicPath: '/',
    },
    resolve: {
      extensions: ['', '.js', '.jsx'],
    },
  },
  parts.indexTemplate({
    title: 'Adam Bergman | Web developer located in Gothenburg',
    appMountId: 'app',
  }),
  parts.loadJSX(PATHS.app),
  parts.loadFavicon(PATHS.favicon),
  parts.loadJson(PATHS.app),
  // parts.lintJSX(PATHS.app),
);

let config;

switch (TARGET) {
  case 'build':
  case 'build:stats':
    config = merge(
      common,
      {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js',
        },
      },
      parts.loadImagesBuild(PATHS.images),
      parts.clean(PATHS.build),
      parts.setFreeVariable('process.env.NODE_ENV', 'production'),
      parts.extractBundle({
        name: 'vendor',
        entries: ['react', 'react-dom'],
      }),
      parts.minify(),
      parts.extractCSS(PATHS.app)
    );
    break;

  case 'test':
  case 'test:watch':
    config = merge(
      common,
      { devtool: 'inline-source-map' },
      parts.loadIsparta(PATHS.app),
      parts.loadJSX(PATHS.app)
    );
    break;

  default:
    config = merge(
      common,
      {
        devtool: 'eval-source-map',
      },
      parts.setupCSS(PATHS.app),
      parts.loadImagesDev(PATHS.images),
      parts.devServer({
        host: process.env.HOST,
        port: process.env.PORT,
        poll: ENABLE_POLLING,
      }),
      parts.enableReactPerformanceTools()
    );
}

export default validate(config, { quiet: true });
