<template>
  <div class="captcha"> </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
onMounted(() => {
  console.log("组件已挂载");
});

onUnmounted(() => {
  console.log("组件即将卸载");
});
</script>
