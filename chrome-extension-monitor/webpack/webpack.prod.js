const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = merge(common, {
  mode: "production",
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.min.js",
    },
  },
  // plugins: [new BundleAnalyzerPlugin()],
});
