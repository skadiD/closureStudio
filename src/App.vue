<template>
  <Docker />
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
<script setup lang="ts">
import { loadTheme } from "./plugins/common";
import Docker from "./components/toast/Docker.vue";
import { config } from "./plugins/sse";
import { fetchSytemConfig } from "./plugins/axios";
import { loadAssets } from "./plugins/assets/assets";
fetchSytemConfig().then(res => {
  if (res.data) config.value = res.data
})
loadTheme()
loadAssets()
</script>