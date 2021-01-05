var path = require("path");

const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "src");

module.exports = {
  entry: {
    app: srcDir + "/index.js"
  },
  mode: "development",
  output: {
    path: distDir,
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: srcDir,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
            plugins: ["@babel/plugin-proposal-class-properties"]
          }
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  devServer: {
    publicPath: "/",
    contentBase: "./"
  }
};
