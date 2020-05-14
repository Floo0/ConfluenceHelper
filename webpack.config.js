const HtmlWebPackPlugin = require("html-webpack-plugin");
const EncodingPlugin = require('webpack-encoding-plugin');

module.exports = {
  devServer: {
    contentBase: __dirname + "/dist",
    // watchContentBase: true,
    host: "localhost"
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
        test: /\.html$/,
        use: [
          {
            loader: "html-loader"
          }
        ]
      },
      {                
        test: [/.css$/],                
        use:[                    
         'style-loader',                  
         'css-loader'
        ]            
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: __dirname + "/src/index.html",
      filename: './index.html'
    }),
    new EncodingPlugin({
      encoding: 'utf8'
    })
  ]
}