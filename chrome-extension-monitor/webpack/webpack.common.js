const webpack = require("webpack"),
  path = require("path"),
  join = path.join,
  fileSystem = require("fs"),
  env = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: process.env.PORT || 3000,
  },
  CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin,
  CopyWepbackPlugin = require("copy-webpack-plugin"), // REVIEW
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  WriteFilePlugin = require("write-file-webpack-plugin"),
  ExtensionReloader = require("webpack-extension-reloader"),
  TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin"),
  VueLoaderPlugin = require("vue-loader").VueLoaderPlugin;

var fileExtensions = ["jpg", "jpeg", "png", "gif", "eot", "otf", "svg", "ttf", "woff", "woff2"];

const srcDir = path.resolve(join(__dirname, "../src/"));
const buildDir = path.resolve(join(__dirname, "../build/"));

const isDev = process.env.NODE_ENV === "development";

module.exports = {
  entry: {
    popup: join(srcDir, "popup/index.ts"),
    options: join(srcDir, "options/index.ts"),
    background: join(srcDir, "background/index.ts"),
  },
  output: {
    path: buildDir,
    filename: "[name].js",
  },
  optimization: {
    splitChunks: false,
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      // Super thanks to https://stackoverflow.com/a/55234989
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          transpileOnly: isDev,
          appendTsSuffixTo: [/\.vue$/],
        },
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader", options: { importLoaders: 1 } }, { loader: "postcss-loader" }],
        include: srcDir,
      },
      {
        test: new RegExp(".(" + fileExtensions.join("|") + ")$"),
        loader: "file-loader?name=[name].[ext]",
        exclude: /node_modules/,
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "html-loader",
          },
          {
            loader: "markdown-loader",
            options: {
              /* your options here */
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".vue"],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: join(__dirname, "../tsconfig.json"),
        extensions: [".ts", ".tsx", ".js", ".vue"],
      }),
    ],
    alias: {
      lodash: "lodash-es",
    },
  },
  plugins: [
    require("tailwindcss"),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      title: process.env.npm_package_name,
      meta: {
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#000000",
      },
      manifest: "manifest.json",
      filename: "popup.html",
      template: "src/assets/popup.html",
      chunks: ["popup"],
      hash: true,
    }),
    new HtmlWebpackPlugin({
      title: process.env.npm_package_name,
      meta: {
        charset: "utf-8",
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#000000",
      },
      manifest: "manifest.json",
      filename: "options.html",
      template: "src/assets/options.html",
      chunks: ["options"],
      hash: true,
    }),
    new CopyWepbackPlugin([{ from: ".", to: buildDir }], { context: "public" }),
    new CopyWepbackPlugin([
      {
        from: "src/manifest.json",
        to: buildDir,
        transform: function(content, path) {
          // generates the manifest file using the package.json informations
          return Buffer.from(
            JSON.stringify({
              description: process.env.npm_package_description,
              version: process.env.npm_package_version,
              ...JSON.parse(content.toString()),
            }),
          );
        },
      },
    ]),
  ],
  stats: "minimal",
};
