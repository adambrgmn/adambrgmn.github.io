const webpack = require('webpack');
const merge = require('webpack-merge');
const development = require('./webpack.development');
const production = require('./webpack.production');

module.exports = (env) => {
  const common = {
    output: { filename: '[name].js' },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      }),
    ],
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    performance: {
      hints: false,
    },
  };

  if (env === 'production') {
    return merge(common, production);
  }

  return merge(common, development);
};
