const { merge } = require('webpack-merge')
const common = require('./webpack.config.common.js')

//和common配置文件合并
module.exports = merge(common, {
  devtool: 'inline-source-map',
  mode: 'development',
  devServer: {
    disableHostCheck: true,
    contentBase: './dist',
  },
})
