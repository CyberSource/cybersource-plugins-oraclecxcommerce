const path = require('path');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const baseAppPath = './widget/saved-cards/js';

module.exports = {
  devtool: 'source-map',
  context: __dirname,
  entry: {
    'saved-cards': `${baseAppPath}/saved-cards.ts`
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: '@ts-tools/webpack-loader',
        exclude: /node_modules/
      },
      {
        test: [/\.html$/, /\.template$/, /\.txt$/],
        use: 'html-loader'
      },
      {
        test: /\.less$/,
        use: ['style-loader', 'css-loader', 'less-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: require.resolve('./tsconfig.json')
      })
    ]
  },
  optimization: {
    minimize: false
  }
};
