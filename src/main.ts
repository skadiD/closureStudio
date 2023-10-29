import './assets/style.css'
import './assets/main.css'

import {createPinia} from "pinia";
import {persist} from "pinia-persists";
import BaseLayout from "./components/layout/BaseLayout.vue";
import { createHead } from '@unhead/vue'
// @ts-ignore
import VueClickAway from "vue3-click-away";
import {router} from "./plugins/router";
import {createApp} from "vue";
import App from "./App.vue";
import { VueRecaptchaPlugin } from 'vue-recaptcha'
const pinia = createPinia();
const app = createApp(App);
const head = createHead()
pinia.use(
    persist({
        prefix: "closureV3",
    })
);
app.component("layout", BaseLayout);
app.use(VueClickAway).use(router).use(pinia).use(head).use(VueRecaptchaPlugin, {
    v3SiteKey: "6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN",
}).mount("#app");

