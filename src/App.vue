<template>
  <Docker />
  <div id="captcha" :class="{ 'h-0': true }">
    <Geetest />
  </div>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script setup lang="ts">
import { loadTheme } from "./plugins/common";
import Docker from "./components/toast/Docker.vue";
import { config } from "./plugins/sse/sse";
import { fetchSytemConfig } from "./plugins/axios";
import { loadAssets } from "./plugins/assets/assets";
import Geetest from "./components/Geetest.vue";
fetchSytemConfig().then(res => {
  if (res.data) config.value = res.data
})
loadTheme()
loadAssets()
</script>