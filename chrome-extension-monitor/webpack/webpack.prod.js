const merge = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = merge(common, {
  mode: "production",
  resolve: {
    alias: {
      vue$: "vue/dist/vue.runtime.min.js",
    },
  },
});
