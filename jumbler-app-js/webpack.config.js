const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
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
          test: /\.module\.css$/i,
          use: [
            "style-loader",
            {
              loader: "css-loader",
              options: {
                modules: {
                  namedExport: false
                },
              }
            }],
        },
        {
          test: /\.css$/i,
          exclude: /\.module\.css$/i,
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
          const licenseFile = Object.keys(compilation.assets).find(f => f.includes("THIRD-PARTY-LICENSES.dev"));
          return {
            bundleHref: bundleFile,
            licenseHref: licenseFile,
          };
        },
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(srcDir, "favicon.ico"), to: distDir },
          { from: path.join(srcDir, "portrait-mg.png"), to: distDir },
          { from: path.join(srcDir, "asset-manifest.json"), to: distDir },
          { from: path.join(srcDir, "wrapper.html"), to: distDir },
          { from: path.join(srcDir, "AWS-services.svg"), to: distDir },
          { from: path.join(srcDir, "initial-text.txt"), to: distDir },
        ],
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
