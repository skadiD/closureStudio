<template>
  <div class="captcha"> </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted } from "vue";
onMounted(() => {
  console.log("geetest mounted");
});

onUnmounted(() => {
  console.log("geetest unmounted");
});
</script>
