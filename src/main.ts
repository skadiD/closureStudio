import "./assets/style.css";
import "./assets/main.css";
import "./plugins/hook";
import { createPinia } from "pinia";
import { persist } from "pinia-persists";
import BaseLayout from "./components/layout/BaseLayout.vue";
// @ts-ignore
import VueClickAway from "vue3-click-away";
import { router } from "./plugins/router";
import { createApp } from "vue";
import App from "./App.vue";
import "./plugins/captcha/gt.0.4.8";
import { initSW } from "./swloader";

const pinia = createPinia();
pinia.use(
  persist({
    prefix: "closureV3",
  })
);

const app = createApp(App);
app.component("layout", BaseLayout);
app.use(VueClickAway).use(router).use(pinia).mount("#app");

if (import.meta.env.MODE !== "development") {
  initSW();
}
