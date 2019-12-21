import Popup from "./pages/popup.vue";
import Issues from "./pages/issues.vue";
import Reviews from "./pages/reviews.vue";

export default [
  {
    name: "popup",
    path: "/",
    component: Popup,
  },
  {
    name: "issues",
    path: "/issues",
    component: Issues,
    props: true,
  },
  {
    name: "reviews",
    path: "/reviews",
    component: Reviews,
    props: true,
  },
];
