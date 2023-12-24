<template>
  <dialog ref="QQBindRef" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>QQ 绑定</h2>
      <div class="flex justify-center">
        <span v-if="isLoading" class="loading loading-bars" />
      </div>
      <div v-if="!isLoading">
        <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2 my-4">
          请点击下方QQ进行复制, 并发送到QQ官方群组中。
          <div class="flex justify-center">
            <p target="_blank" @click="copyQQCodeAndOpenLink"
              href="https://qm.qq.com/cgi-bin/qm/qr?k=YNU1S-_hVFD89w3cj8-ewkPFXXSiBRbY&jump_from=webapi&authKey=BU70QS4whXzJIi62KWNd9h8HZB5Vl2FSnjlrqYYf08RL5tbxnZhf2NMr9uLJNoYu">
              <Icon icon="bi:tencent-qq" width="48" height="48" />
            </p>
            <p href="qq://group/?code=450555868" target="_blank">
              <Icon icon="bi:tencent-qq" width="48" height="48" />
            </p>
          </div>
        </div>
        <p @click="copyQQCode">{{ qqCode }}</p>
        <button @click="QQBindRef.close()" class="btn btn-info btn-block mb-3">关闭</button>
      </div>

    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { watch, onMounted, onUnmounted, ref } from 'vue';
import { fetchQQBindCode } from "../../plugins/axios";
import { QQBindRef } from './index';
import { userQuota } from '../../plugins/quota/userQuota';
import { NOTIFY } from '../../plugins/config';
import { setMsg, sleep } from '../../plugins/common';
import { Type } from '../toast/enmu';
import { Icon } from '@iconify/vue';

const qqCode = ref('')
const isLoading = ref(true)
const isOpen = ref(false)
const quota = userQuota.value.data.value
let intervalId: number | null = null;
let observer: MutationObserver;
const observerConfig: MutationObserverInit = { attributes: true };

onMounted(() => {
  const dom = QQBindRef.value;
  const callback = (mutationsList: MutationRecord[]) => {
    mutationsList.forEach((mutation: MutationRecord) => {
      if (mutation.type === "attributes" && mutation.attributeName === "open") {
        isOpen.value = dom.open;
      }
    });
  };
  observer = new MutationObserver(callback);
  if (dom) observer.observe(dom, observerConfig);
});

onUnmounted(() => {
  if (observer) observer.disconnect();
})

watch(() => isOpen.value, (isOpen) => {
  if (isOpen) {
    fetchQQBindCode();
    intervalId = window.setInterval(getQQBindCode, 5000);
  } else {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});
const copyQQCodeAndOpenLink = async (event: MouseEvent) => {
  event.preventDefault();
  const target = event.currentTarget as HTMLAnchorElement;
  copyQQCode();
  await sleep(2000);
  window.open(target.href, '_blank');
};

const copyQQCode = async () => {
  try {
    // 复制 qqcode 的值到剪贴板
    await navigator.clipboard.writeText(qqCode.value);
    setMsg('QQ号已复制到剪贴板', Type.Success)
  } catch (err) {
    setMsg('复制失败', Type.Warning)
  }
};

const getQQBindCode = () => {
  if (quota?.idServerQQ) {
    qqCode.value = quota.idServerQQ
    return
  }
  fetchQQBindCode().then((res) => {
    if (res.code === 1) {
      qqCode.value = res.data as string
      return
    }
    if (res.code === 2) {
      qqCode.value = NOTIFY.ALREADY_BIND_QQ
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return
    }
  }).finally(() => {
    isLoading.value = false
  })
}



</script>
  