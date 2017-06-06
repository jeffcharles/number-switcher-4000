const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: ['react-hot-loader/patch', './src/index.tsx']
  },
  output: {
    filename: 'bundle.[hash].js',
    path: `${__dirname}/dist`
  },

  devtool: 'source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  },

  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              sourceMap: true,
              importLoaders: 1,
              localIdentName: '[name]--[local]--[hash:base64:8]'
            }
          },
          'postcss-loader'
        ]
      }
    ]
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env['NODE_ENV'])
      }
    }),
    new HtmlWebpackPlugin({
      template: 'index.html.ejs'
    })
  ],

  devServer: {
    hot: true
  }
};
