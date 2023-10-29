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
  import {userStore} from "./store/user";
  import {storeToRefs} from "pinia";
  import {inject} from "vue";
  import {Axios} from "axios";
  import {config} from "./views/common";
  import {fetchSytemConfig} from "./plugins/axios";
  import {useRecaptchaProvider} from "vue-recaptcha";
  fetchSytemConfig().then(res => {
    if (res.data) config.value = res.data
  })
  const _user = userStore()
  const { user } = storeToRefs(_user)
  loadTheme()
  useRecaptchaProvider()
</script>