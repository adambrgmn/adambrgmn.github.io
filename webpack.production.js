/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');

module.exports = {
  plugins: [new webpack.optimize.UglifyJsPlugin()],
};
