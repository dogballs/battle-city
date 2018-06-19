// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const { CheckerPlugin } = require('awesome-typescript-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/main.ts',

  output: {
    filename: 'bundle.js',
  },

  mode: 'development',

  devtool: 'source-map',

  resolve: {
    extensions: ['.js', '.ts'],
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
      },
    ],
  },

  plugins: [
    new CheckerPlugin(),
    new CopyWebpackPlugin([
      'index.html',
      { from: 'images/', to: 'images/' },
      { from: 'styles/', to: 'styles/' },
    ]),
  ],
};
