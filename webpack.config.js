const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const development = require('./webpack.development');
const production = require('./webpack.production');

module.exports = (env, opts) => {
  const common = {
    entry: {
      main: './src/js/main.js',
    },
    output: {
      path: path.resolve(__dirname, opts.outputPath),
      filename: '[name].js',
      publicPath: '/assets/js',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      ],
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.json'],
    },
    performance: { hints: false },
    target: 'web',
    externals: [],
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
      new webpack.optimize.CommonsChunkPlugin({
        name: ['manifest'],
        minChunks: Infinity,
      }),
    ],
  };

  if (env === 'production') {
    return merge(common, production);
  }

  return merge(common, development);
};
