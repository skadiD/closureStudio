<template>
  <dialog :ref="qqModel" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>QQ 绑定</h2>
      <p>{{ qqCode }}</p>
      <button class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { fetchQQBindCode } from "../../plugins/axios";
import { userQuota } from '../../plugins/quota/userQuota';
import { NOTIFY } from '../../plugins/config';
interface Props {
  qqModel: any
}
const props = withDefaults(defineProps<Props>(), {
  qqModel: null
});
const qqCode = ref('')
const isLoading = ref(false)
const quota = userQuota.value.data.value
const intervalId = ref<number | null>(null);
watch(() => props.qqModel, (newVal, oldVal) => {
  if (newVal) {
    intervalId.value = window.setInterval(getQQBindCode, 5000);
  }
});

const getQQBindCode = () => {
  if (quota?.idServerQQ) {
    qqCode.value = quota.idServerQQ
    return
  }
  isLoading.value = true
  fetchQQBindCode().then((res) => {
    if (res.code === 1) {
      qqCode.value = res.data as string
      return
    }
    if (res.code === 2) {
      qqCode.value = NOTIFY.ALREADY_BIND_QQ
      return
    }


  }).finally(() => {
    isLoading.value = false
  })
}
</script>
  