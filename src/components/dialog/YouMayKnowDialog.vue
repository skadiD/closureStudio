<template>
  <BaseDialog :dialogId="dialogId">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>你知道吗？</h2>
      <p>{{ message }}</p>
      <button @click="close" class="btn btn-info btn-block mb-3">我知道了</button>
    </div>
  </BaseDialog>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import BaseDialog from './base/BaseDialog.vue';
import { selectRandomElement, YouMayKnowArray } from '../../plugins/common';
import { dialogClose, dialogOpen } from '.';

const dialogId = ref('youMayKnow')
const message = ref('')

onMounted(() => {
  const element = selectRandomElement<string>(YouMayKnowArray);
  if (element) message.value = element;
  dialogOpen(dialogId.value)
})

const close = () => {
  dialogClose(dialogId.value)
}

</script>
  