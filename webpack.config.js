const path = require('path');

module.exports = {
  entry: './app.es6',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'public'),
  },
  mode: 'development',
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /(\.es6$|\.jsx$)/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "entry",
                  targets: "defaults",
                  corejs: 3
                }
              ],
              "@babel/preset-react"
            ],
            plugins: [
              [
                "@babel/plugin-transform-runtime",
                {
                  absoluteRuntime: false,
                  corejs: false,
                  helpers: true,
                  regenerator: true,
                  useESModules: true,
                  version: "^7.7.4"
                }
              ]
            ]
          }
        }
      }
    ]
  }
};
