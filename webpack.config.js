const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const glob = require('glob');
const PAGE_PATH = path.resolve(__dirname, './src/pages');
const entryFiles = glob.sync(PAGE_PATH + '/*.js');

const DEV = process.env.NODE_ENV === 'development';

function entriesAndOutput() {
  let entries = {}, htmlTemplates = [];
  entryFiles.map(filePath => {
    let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
    entries[filename] = filePath;
    htmlTemplates.push(new HtmlWebpackPlugin({
      filename: `${filename}.html`,
      template: path.resolve(__dirname, './index.html'),
      inject: true,
      chunks: [filename],
      minify: {
        removeAttributeQuotes: true,
        removeComments: true,
        collapseWhitespace: true
      }
    }))
  })
  return { entry: entries, output: htmlTemplates }
}

const config = {
  mode: "development",
  entry: entriesAndOutput().entry,
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules)/,
        use: ['babel-loader']
      },
      {
        test: /\.(css|scss|sass|less)/,
        use: [
          DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          'less-loader'
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /.*/, to: path.posix.join('/', 'index.html') },
      ],
    },
    open: true,
    hot: true,
    compress: true,
    port: 2019,
    contentBase: false,
    inline: true,
    stats: {
      children: false,
      modules: false,
    },
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    ...entriesAndOutput().output,
    new MiniCssExtractPlugin({
      filename: 'css/[name].bundle.css',
      chunkFilename: '[id].bundle.css',
    }),
  ]
}

if (!DEV) {
  config.output.filename = 'js/[name].[chunkhash].js';
  config.mode = 'production';
  config.devtool = '#source-map';
  config.plugins = config.plugins.concat([
    new CleanWebpackPlugin(['dist']),
    new webpack.DefinePlugin({ 'process.env': { NODE_ENV: "production" } }),
    new webpack.LoaderOptionsPlugin({ minimize: true }),
  ])
} else {
  config.plugins = config.plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ])
}

module.exports = config;
