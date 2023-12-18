<template>
  <dialog ref="closeAnn" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>平台打烊中</h2>
      <p>可露希尔大卖场积极维护中，欢迎明天再来！</p>
      <button class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { watch, ref } from "vue";
import { userStore } from "../../store/user";
import { config } from "../../plugins/sse/sse";
const closeAnn = ref()
const user = userStore()
watch(
  () => config.value.isUnderMaintenance,
  (v) => {
    if (v && !user.isAdmin) closeAnn.value.showModal()
  }
)
</script>
