const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const ExtensionReloader = require("webpack-extension-reloader");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

module.exports = merge(common, {
  devtool: "inline-source-map",
  mode: "development",
  plugins: [
    new FriendlyErrorsWebpackPlugin(),
    new ExtensionReloader({
      reloadPage: true, // Force the reload of the page also
      entries: {
        background: "background.js",
        extensionPage: ["popup.js", "options.js"],
      },
    }),
  ],
  output: {
    devtoolModuleFilenameTemplate: info => {
      let $filename = "sources://" + info.resourcePath;
      if ((info.resourcePath.match(/\.vue$/) && !info.query.match(/type=script/)) || `${info.moduleId}` !== ``) {
        $filename = "webpack-generated:///" + info.resourcePath + "?" + info.hash;
      }
      return $filename;
    },
    devtoolFallbackModuleFilenameTemplate: "webpack:///[resource-path]?[hash]",
  },
  resolve: {
    alias: {
      vue$: "vue/dist/vue.esm.js",
    },
  },
  devServer: {
  stats: "minimal"
    quiet: true,
    watchContentBase: true,
    disableHostCheck: true,
  },
});
