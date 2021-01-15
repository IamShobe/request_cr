const path = require('path');


module.exports = {
  entry: {
    contentScript: path.resolve(__dirname, 'src', 'index.jsx'),
    popup: path.resolve(__dirname, 'src', 'popup.jsx'),
    background: path.resolve(__dirname, 'src', 'background.js')
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'public')
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ]
  }
};