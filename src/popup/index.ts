import Vue from "vue";
import Popup from "./popup.vue";
import VueTailwind from "vue-tailwind";

import MyOwnTheme from "./theme";

const styles = require("./popup.css");

Vue.use(VueTailwind, {
  theme: MyOwnTheme,
});

Vue.component("popup", Popup);

new Vue({
  el: "#app",
  render: createElement => {
    return createElement(Popup);
  },
});
