import Vue from "vue";
import App from "./app.vue";
import router from "./router";

// import devtools from "@vue/devtools";

// if (process.env.NODE_ENV === "development") {
//   devtools.connect();
// }

//@ts-ignore
global.browser = require("webextension-polyfill");
//@ts-ignore
Vue.prototype.$browser = global.browser;
//@ts-ignore
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import VueTailwind from "vue-tailwind";
import DateFilter from "@/filters/date"; // Import date

import MyOwnTheme from "./theme";

const styles = require("./app.css");

Vue.filter("date", DateFilter);

Vue.component("font-awesome-icon", FontAwesomeIcon);

Vue.config.productionTip = false;

Vue.use(VueTailwind, {
  theme: MyOwnTheme,
});

Vue.component("app", App);

new Vue({
  el: "#app",
  router,
  render: h => h(App),
});
