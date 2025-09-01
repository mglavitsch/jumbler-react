const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const packageJson = require("./package.json");
const LicenseWebpackPlugin = require('license-webpack-plugin').LicenseWebpackPlugin;
const SimpleLicensePlugin = require("./SimpleLicensePlugin");

const distDir = path.resolve(__dirname, "dist"); // bundle.js goes here
const srcDir = path.resolve(__dirname, "src");

module.exports = (env, argv) => {
  const isDev = argv.mode === "development";

  return {
    entry: path.join(srcDir, "index.js"),
    mode: isDev ? "development" : "production",
    output: {
      path: distDir,
      filename: "bundle.[contenthash].js",
      publicPath: "/dist/",
      clean: true,
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
              plugins: ["@babel/plugin-transform-class-properties"],
            },
          },
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
      ],
    },
    plugins: [
      new LicenseWebpackPlugin({
        outputFilename: "THIRD-PARTY-LICENSES.txt",
        excludedPackageTest: (packageName) => Boolean(packageJson.devDependencies?.[packageName]),
      }),
      new SimpleLicensePlugin({
        outputFilename: "THIRD-PARTY-LICENSES.dev.txt",
      }),
      new HtmlWebpackPlugin({
        template: path.join(srcDir, "index.html"),
        filename: "index.html",
        inject: false,
        minify: false,
        templateParameters: (compilation) => {
          const bundleFile = Object.keys(compilation.assets).find(f => f.includes("bundle"));
          const licenseFile = Object.keys(compilation.assets).find(f => f.includes("THIRD-PARTY-LICENSES"));
          return {
            bundleHref: bundleFile,
            licenseHref: licenseFile,
          };
        },
      }),
    ],
    devServer: {
      static: {
        directory: __dirname,
      },
      compress: true,
      port: 8080,
      hot: true,
      client: { overlay: false },
    },
    resolve: {
      extensions: [".js", ".jsx"],
    },
    devtool: isDev ? "eval-source-map" : false,
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false, // disables separate .LICENSE.txt
        }),
      ],
    },
  };
};
