<template>
  <dialog ref="QQBindRef" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>QQ 绑定</h2>
      <p>{{ qqCode }}</p>
      <button class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { QQBindRef } from './index'
const qqCode = ref('123456')
</script>
  