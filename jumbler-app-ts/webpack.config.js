var path = require("path");

const distDir = path.join(__dirname, "dist");
const srcDir = path.join(__dirname, "src");

module.exports = {
  entry: srcDir + "/index.tsx",
  mode: "production",
  output: {
    path: distDir,
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      }
    ]
  }
};
