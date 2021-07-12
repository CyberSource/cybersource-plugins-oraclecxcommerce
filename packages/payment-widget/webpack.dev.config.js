const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const baseAppPath = './widget/isv-occ-payment/js';

const isHttps = Boolean(process.env.NODE_HTTPS);

module.exports = merge(common, {
  devServer: {
    https: isHttps,
    disableHostCheck: true
  },
  mode: 'development',
  entry: {
    'occ-mocks': require.resolve('@isv-occ-payment/occ-mock-storefront/src/index.ts'),
    'client-main': `${baseAppPath}/dev/client-main.ts`
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Payment Plugin',
      template: `${baseAppPath}/dev/index.html`
    }),
    new webpack.EnvironmentPlugin({
      BASE_MOCK_API_HOST: isHttps ? 'https://localhost:5001' : 'http://localhost:5000',
      BASE_API_HOST: isHttps ? 'https://localhost:3001' : 'http://localhost:3000',
      BASE_API_URL: '/ccstorex/custom/isv-payment/v1'
    })
  ],
  resolve: {
    alias: {
      ccConstants: require.resolve('@isv-occ-payment/occ-mock-storefront/src/ccConstants.ts'),
      pubsub: require.resolve('@isv-occ-payment/occ-mock-storefront/src/pubsub.ts'),
      ccRestClient: require.resolve('@isv-occ-payment/occ-mock-storefront/src/ccRestClient.ts'),
      ccLogger: require.resolve('@isv-occ-payment/occ-mock-storefront/src/ccLogger.ts')
    }
  },
  optimization: {
    runtimeChunk: 'single'
  }
});
