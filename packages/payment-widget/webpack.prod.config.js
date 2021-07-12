const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const externalLib = (externalLib) => ({
  amd: externalLib,
  commonjs: externalLib,
  commonjs2: externalLib
});

module.exports = merge(common, {
  mode: 'production',
  output: {
    libraryTarget: 'amd',
    libraryExport: 'default'
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      BASE_API_HOST: '',
      BASE_API_URL: '/ccstorex/custom/isv-payment/v1'
    })
  ],
  externals: {
    jquery: externalLib('jquery'),
    knockout: externalLib('knockout'),
    ccConstants: externalLib('ccConstants'),
    pubsub: externalLib('pubsub'),
    ccRestClient: externalLib('ccRestClient'),
    ccLogger: externalLib('ccLogger'),
    'knockout.validation': externalLib('knockout.validation')
  },
  optimization: {
    minimize: false
  }
});
