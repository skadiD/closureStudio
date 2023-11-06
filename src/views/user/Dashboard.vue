<template>
  <div class="flex h-full">
    <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl s-margin xl:mr-auto" :class="show ? 'xl:ml-0' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
      <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
        <h2>📢 今日特价</h2>
        <p v-for="k in (config.announcement?.split('\n') || ['可露希尔逃跑了'])">{{ k }}</p>
        <div class="divider mt-0">个人信息</div>
        <p v-if="user.Info.status < 1 && !gameList?.length">你的账号没有完成<span class="text-info font-bold">【真实玩家认证】</span>，请先添加第一个游戏账号后完成绑定～(∠・ω&lt; )⌒★</p>
        <p v-if="user.Info.status < 1 && gameList?.length && (firstGame.status.created_at + 86400 - now > 0)">恭喜你添加了第一个账号！现在你可以正常使用并在<b>【{{ calc(firstGame.status.created_at + 86400, now) }}】</b>内完成【手机号：{{ firstGame.game_config.account?.replace(/(\d{3})\d{6}(\d{2})/, '$1****$2') }}】的<b>短信认证</b></p>
        <p v-if="user.Info.status < 1 && gameList?.length && (firstGame.status.created_at + 86400 - now < 0)">你未在规定的时间内完成短信认证，你的游戏账号与平台账号已被<b>冻结使用</b></p>
      </div>
      <div class="my-5 bg-info/5 shadow-md px-4 py-5 flex flex-col relative rounded-lg">
        <span class="font-bold text-2xl">欢迎来到可露希尔线上零售店</span>
        <span class="text-2xl text-base-content/60">当前托管运行状况：<b class="text-info">良好</b></span>
        <div class="mt-8">
          <span class="font-bold text-4xl">点击 ↓↓ 查看<span class="text-info">『托管详情』</span></span><br>
          <img class="absolute right-0 bottom-0 w-28 md:w-36 opacity-10 md:opacity-50 rounded-t-full rounded-bl-full" src="/public/assets/closure.ico" alt="start">
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GameAccount @click="op(1)" v-for="row in gameList" :game="row">
          <div class="divider mt-2 mb-3 text-info font-arknigths text-xl">START</div>
          <div class="grid gap-4 grid-cols-2 mt-2">
            <button class="btn btn-outline btn-sm btn-block btn-primary" v-if="row.status.code != 0">暂停</button>
            <button class="btn btn-outline btn-sm btn-block btn-info" v-else>启动</button>
            <button class="btn btn-outline btn-sm btn-block btn-error">删除</button>
          </div>
        </GameAccount>
        <GameAccount :is-add="true" :allow="(user.Info.status < 1 && gameList?.length == 0) || gameList?.length < user.max_slot" @click="op(0)"/>
      </div>
    </div>

    <div class="bg-base-300 flex-1 flex flex-col ml-4 md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated" v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
      <GameAdd v-if="target == 0" />
      <GamePanel v-else-if="target == 1" />
    </div>
  </div>
  <dialog ref="closeAnn" class="modal" style="outline-width: 0">
    <div class="bg-base-100 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>平台打烊中</h2>
      <p >可露希尔大卖场积极维护中，欢迎明天再来！</p>
      <button class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
    </div>
  </dialog>
</template>
<script setup lang="ts">
import {computed, ref, watch} from "vue";
import {config} from "../common";
import GameAccount from "../../components/card/GameAccount.vue";
import 'animate.css';
import GameAdd from "../../components/card/GameAdd.vue";
import GamePanel from "../../components/card/GamePanel.vue";
import {userStore} from "../../store/user";
import {storeToRefs} from "pinia";
import {fetchGameList} from "../../plugins/axios";
import {setMsg} from "../../plugins/common";
import {Type} from "../../components/toast/enmu";

const closeAnn = ref()
const show = ref(false)
const target = ref(-1)
const op = (t: number) => {
  if (t == 0 && (user.value.Info.status < 1 || gameList.value?.length < user.value.max_slot)) {
    const content = (user.value.Info.status < 1 && gameList.value?.length > 0) ? '请完成首账号绑定验证' :
        gameList.value?.length > user.value.max_slot ? '你的托管数量已达上限' : ''
    setMsg(content, Type.Alert);
    return
  }
  show.value = target.value != t
  target.value = target.value == t ? -1 : t
}
const now = Math.round(Date.now() / 1000)
const user_ = userStore()
const { user } = storeToRefs(user_)
watch(
    () => config.value.isUnderMaintenance,
    (v) => {
      if (v && !user.value.Info.isAdmin) closeAnn.value.showModal()
    }
)
const gameList = ref<ApiUser.Game[]>([])
const firstGame = computed(() => {
  return gameList.value[0]
})
fetchGameList().then(res => {
  if (res.data) gameList.value = res.data
})
const calc = (ts1: number, ts2: number) => {
  const during = Math.abs(ts1 - ts2);
  const hours = Math.floor(during / (60 * 60));
  const minutes = Math.floor((during % (60 * 60)) / 60);
  return `${hours}小时${minutes}分钟`;
}
</script>
<style>
  div, img {
    user-select: none;
    -webkit-user-drag: none;
  }
</style>