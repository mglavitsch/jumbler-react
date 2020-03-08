var path = require("path");

const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "src");

module.exports = {
  entry: srcDir + "/index.js",
  mode: "production",
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
  }
};
