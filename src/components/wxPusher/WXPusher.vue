<template>
  <div>
    <!-- header -->
    <div v-if="isLoading">
      <span className="loading loading-bars loading-lg"></span>
      <span className="loading loading-bars loading-lg"></span>
      <span className="loading loading-bars loading-lg"></span>
    </div>
    <div v-if="!isLoading">
      <div v-if="wxPuhser">
        <p class="my-2 text-2xl font-bold">博士你真棒，微信已绑定！{{ wxPuhser.userName }}</p>
        <button class="btn btn-info btn-sm my-2" @click="queryWxPusher">取消绑定</button>
      </div>
      <div v-if="!wxPuhser">
        <p class="my-2 text-2xl font-bold">噢天啊，博士，快快绑定微信接收最新消息！！！</p>
        <div v-if="QRCode" class="w-48 h-48">
          <img :src="QRCode.url" alt="QRCode" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useWXPusher } from '../../plugins/wxPusher/wxPusher';

let intervalId = null; // 用于存储setInterval返回的ID

onMounted(() => {
  queryWxPusher();
  createQRCodes();
  intervalId = setInterval(() => {
    queryWxPusher();
  }, 10000);
});

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});
const { isLoading, wxPuhser, QRCode, queryWxPusher, createQRCodes } = useWXPusher();
</script>