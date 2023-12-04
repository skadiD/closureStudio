<template>
  <div class="captcha" />
</template>
<script lang="ts" setup>
  import {onMounted} from "vue";

  const prop = defineProps<{
    captchaConfig: {
      config: any
      handler: any
    }
  }>()
  onMounted(() => {
    //@ts-ignore
    window.initGeetest4(prop.captchaConfig.config, prop.captchaConfig.handler)
  })
</script>
