<template>
  <a class="text-3xl mt-2 text-info font-bold">托管详情</a>
  <div class="divider">账号信息</div>
  <div class="w-full grid grid-cols-3 justify-items-center">
    <div class="flex flex-col" v-for="m in 3">
      <span class="text-base-content/70 text-xl font-extrabold">{{ ['龙门币', '合成玉', '源石'][m - 1] }}</span>
      <span class="text-3xl text-center mt-2 font-en">
        {{ [details?.status?.gold, details?.status?.diamondShard, details?.status?.androidDiamond][m - 1] }}
      </span>
    </div>
  </div>
  <div class="divider text-info text-lg font-bold"> 理智溢出: {{ formatTime(
    ((details?.status.maxAp || 0) - (Math.floor((Date.now() / 1000 - (details?.status.lastApAddTime || 0)) / 360) +
      (details?.status.ap || 0))) * 360 + Math.ceil(Date.now() / 1000)
    , true) }} </div>
  <button class="btn btn-info btn-outline btn-block my-1" @click="configModel.showModal()">托管配置</button>
  <div class="divider">不实时日志</div>
  <div class="h-[calc(100vh-28rem)] overflow-y-auto">
    <table class="text-[1rem]">
      <tbody>
        <tr v-for="log in gameLogs.logs">
          <td class="text-info whitespace-nowrap">{{ formatTime(log.ts, true) }}</td>
          <td class="pl-2">{{ log.content }}</td>
        </tr>
      </tbody>
    </table>
    <button :disabled="!gameLogs.hasMore || isLoadingGameLogs" class="btn btn-info btn-outline btn-block my-1"
      @click="getLogs">
      {{ '加载更多' }}
    </button>
  </div>
  <a class="btn btn-block btn-info mt-2">查看托管截图</a>
  <dialog ref="configModel" class="modal" style="outline-width: 0">
    <div class="modal-box">
      <Config :account="props.account" />
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import { ref, watch } from "vue";
import { fetchGameDetails, fetchGameLogs } from "../../plugins/axios";
import { formatTime, setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import Config from "./ConfigPanel.vue";
import { gameList } from "../../plugins/sse";
interface Props {
  account: string,
  // statusCode: number // 当前用户状态，-1=登陆失败 0=未开启/未初始化/正在初始化但未登录 1=登录中 2=登陆完成/运行中 3=游戏错误
}
const props = withDefaults(defineProps<Props>(), {
  account: '',
});

const gameLogs = ref<ApiGame.GameLogs>(
  {
    logs: [],
    hasMore: false
  }
)
const isLoadingGameLogs = ref(false)
const details = ref<ApiGame.Detail>()
const configModel = ref()

watch(() => {
  return gameList.value.find(game => game.status.account === props.account);
}, (newGame) => {
  if (newGame) {
    if (newGame.status.code > 1) {
      getGameDetails();
    }
    getLogs();
  }
});

const getGameDetails = () => {
  fetchGameDetails(props.account).then(res => {
    if (res.data) {
      details.value = res.data
      return
    }
    setMsg(res.message, Type.Warning)
  })
}


const getLogs = () => {
  if (isLoadingGameLogs.value) return
  isLoadingGameLogs.value = true
  const lastLogId = gameLogs.value.logs[gameLogs.value.logs.length - 1]?.id || 0; // 设置为0如果为undefined

  fetchGameLogs(props.account, lastLogId).then(res => {
    if (res.data) {
      gameLogs.value.logs.push(...res.data.logs)
      gameLogs.value.hasMore = res.data.hasMore
      return
    }
    setMsg(res.message, Type.Warning)
  }).finally(() => {
    isLoadingGameLogs.value = false
  });
}



</script>
