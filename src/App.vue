<template>
  <Docker />
  <router-view v-slot="{ Component }">
      <keep-alive>
          <component :is="Component" />
      </keep-alive>
  </router-view>
</template>
<script setup lang="ts">
  import {loadTheme} from "./plugins/common";
  import Docker from "./components/toast/Docker.vue";
  import {config} from "./views/common";
  import {fetchSytemConfig} from "./plugins/axios";
  fetchSytemConfig().then(res => {
    if (res.data) config.value = res.data
  })
  loadTheme()
</script>