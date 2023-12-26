import './assets/style.css'
import './assets/main.css'

import {createPinia} from "pinia";
import {persist} from "pinia-persists";
import BaseLayout from "./components/layout/BaseLayout.vue";
// @ts-ignore
import VueClickAway from "vue3-click-away";
import {router} from "./plugins/router";
import {createApp} from "vue";
import App from "./App.vue";
import "./plugins/geetest/gt.0.4.8";
const pinia = createPinia();
const app = createApp(App);
pinia.use(
    persist({
        prefix: "closureV3",
    })
);
app.component("layout", BaseLayout);
app.use(VueClickAway).use(router).use(pinia).mount("#app");

