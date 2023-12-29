<template>
  <dialog ref="dialog" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>你知道吗？</h2>
      <p>{{ message }}</p>
      <button @click="dialog.close()" class="btn btn-info btn-block mb-3">我知道了</button>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { selectRandomElement, YouMayKnowArray } from '../../plugins/common';
const message = ref('')
const dialog = ref()
onMounted(() => {
  const element = selectRandomElement<string>(YouMayKnowArray);
  if (element) message.value = element;
  dialog.value.showModal();
})
</script>
  