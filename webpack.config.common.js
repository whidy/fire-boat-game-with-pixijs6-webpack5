const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
// const ImageminPlugin = require('imagemin-webpack-plugin').default

module.exports = {
  entry: {
    app: './src/scripts/index.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{
        from: './src/assets',
        to: './assets'
      }]
    }),
    new HtmlWebpackPlugin({
      template: './src/index.html',
      // filename: './dist/index.html'
    }),
  ]
}
