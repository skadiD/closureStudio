<template>
  <div class="flex h-full">
    <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex" :class="show ? 'xl:ml-0  !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
      <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
        <div class="text-2xl md:text-4xl font-bold text-info mt-3">📢 今日特价</div>
        <p v-for="k in (config.announcement?.split('\n') || ['可露希尔逃跑了'])">{{ k }}</p>
        <div class="divider mt-0">个人信息</div>
        <p v-if="!userQuota?.idServerPhone && gameList?.length === 1">
          恭喜你添加了第一个账号！验证码将在托管启动成功后发送，你可以启动游戏体验<b>【{{ calc(gameList[0]?.status.created_at + 86400, now) }}】</b>。<br>
          完成【手机号：{{ gameList[0].status.account?.replace(/(\d{3})\d{6}(\d{2})/, '$1****$2') }}】绑定认证<b class="cursor-pointer" @click="realModel.showModal()">👉点我解锁👈</b>不限时游戏托管，并提升托管数量
        </p>
        <p v-if="!gameList?.length">
          你的账号没有完成
          <span class="text-info font-bold">【真实玩家认证】</span>，请先添加第一个游戏账号后完成绑定～(∠・ω&lt; )⌒★
        </p>
      </div>
      <div class="my-5 bg-info/5 shadow-md px-4 py-5 flex flex-col relative rounded-lg">
        <span class="font-bold text-2xl">欢迎来到可露希尔线上零售店</span>
        <span class="text-2xl text-base-content/60">当前托管运行状况：<b class="text-info">良好</b></span>
        <div class="mt-8">
          <span class="font-bold text-2xl md:text-4xl">点击 ↓↓ 查看<span class="text-info">『托管详情』</span></span><br>
          <img class="absolute right-0 bottom-0 w-28 md:w-36 opacity-10 md:opacity-50 rounded-t-full rounded-bl-full" src="/assets/closure.ico" alt="start">
        </div>
      </div>
      <div class="text-2xl font-bold">我的托管（{{ userQuota?.slots.filter(slot => slot.gameAccount !== null)?.length }} 已用 / {{ userQuota?.slots?.length }} 可用）</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <GameAddCard v-if="!gameList?.length" @click="addModel.showModal()"/>
        <GameAccount v-else v-for="(game, key) in gameList" :game="game" @click="openGameConf(game)" :key="key">
          <div class="divider mt-2 mb-3 text-info font-arknigths text-xl">START</div>
          <div class="grid gap-4 grid-cols-2 mt-2">
            <button class="btn btn-outline btn-sm btn-block btn-primary" v-if="game.status?.code != 0" disabled>暂停</button>
            <button class="btn btn-outline btn-sm btn-block btn-info" v-else @click="show = !show;gameLogin(game)" :disabled="loginBtnLoading">启动</button>
            <button class="btn btn-outline btn-sm btn-block btn-error" disabled @click="gameDel(game)">删除</button>
          </div>
        </GameAccount>
      </div>
    </div>
    <div class="bg-base-300 flex-1 flex flex-col ml-4 md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated" v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
      <GamePanel :account="selectGame" />
    </div>
  </div>
  <dialog ref="closeAnn" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>平台打烊中</h2>
      <p >可露希尔大卖场积极维护中，欢迎明天再来！</p>
      <button class="btn btn-info btn-block mb-3">助力可露希尔砍一刀</button>
    </div>
  </dialog>
  <dialog ref="addModel" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 p-6 shadow-lg max-w-xl rounded-lg">
      <GameAdd :is-first="!userQuota?.idServerPhone" :uuid="slotUUID" />
    </div>
  </dialog>
  <dialog ref="realModel" class="modal" style="outline-width: 0">
    <div class="modal-box">
      <div class="text-3xl text-info font-bold text-center">归属验证</div>
      <div class="s-combo mb-6 mt-4">
        <input class="s-input peer focus:ring-info" v-model="smsCode">
        <label class="s-label peer-focus:text-info">请输入收到的验证码</label>
      </div>
      <button class="btn btn-block btn-info mt-2" @click="smsBtn">确认</button>
    </div>
  </dialog>
  <div id="captcha" :class="{ 'h-0': captchaConfig.config.product === 'bind' }">
    <Geetest :captcha-config="captchaConfig" />
  </div>
</template>
<script setup lang="ts">
import {reactive, ref, watch} from "vue";
import {config, gameList, startSSE} from "../common";
import GameAccount from "../../components/card/GameAccount.vue";
import 'animate.css';
import GamePanel from "../../components/card/GamePanel.vue";
import {userStore} from "../../store/user";
import {storeToRefs} from "pinia";
import {Auth_Refresh, Auth_Verify, doGameLogin, fetchGameDetails, fetchUserSlots} from "../../plugins/axios";
import {setMsg} from "../../plugins/common";
import {Type} from "../../components/toast/enmu";
import GameAddCard from "../../components/card/GameAddCard.vue";
import GameAdd from "../../components/card/GameAdd.vue";
import Geetest from "../../components/Geetest.vue";

const closeAnn = ref()
const addModel = ref()
const realModel = ref()
const show = ref(false)
const user_ = userStore()
const { user } = storeToRefs(user_)

const userQuota = ref<Registry.UserInfo>()
// 现在只有第一个账号
const slotUUID = ref('')
watch(
    () => config.value.isUnderMaintenance,
    (v) => {
      if (v && !user.value.Info.isAdmin) closeAnn.value.showModal()
    }
)
fetchUserSlots().then(res => {
  if (res.data) userQuota.value = res.data
  slotUUID.value = res.data?.slots.filter(slot => slot.gameAccount === null && slot.ruleFlags.includes('slot_account_format_is_phone'))[0]?.uuid || ''
})
const calc = (ts1: number, ts2: number) => {
  const during = ts1 - ts2;
  const hours = Math.floor(during / (60 * 60));
  const minutes = Math.abs(Math.floor((during % (60 * 60)) / 60));
  return `${hours}小时${minutes}分钟`;
}
const now = Math.round(Date.now() / 1000)
const loginBtnLoading = ref(false)
const gameLogin = (game: ApiUser.Game) => {
  loginBtnLoading.value = true
  window.grecaptcha.ready(async () => {
    const token = await window.grecaptcha.execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', {action: 'submit'})
    if (token === '') {
      setMsg('pirnt（\'图灵测试エロ,请检查你的 Network")', Type.Warning)
      loginBtnLoading.value = false
      return;
    }
    login(token, game.status.account)
  })
}
const gameDel = (game: ApiUser.Game) => {
  loginBtnLoading.value = true
}
// 短信验证码
const smsCode = ref('')
const smsBtn = () => {
  if (smsCode.value !== '') {
    Auth_Verify({
      code: smsCode.value,
    }).then(res => {
      if (res.code === 1) {
        setMsg('认证成功', Type.Success)
        Auth_Refresh().then(res => {
          if (res.data) user_.login(res.data.token)
          realModel.value.close()
        })
        return
      }
      setMsg(res.message, Type.Warning)
    })
    return
  }
  setMsg('请输入验证码', Type.Warning)
}
const login = (token: string, account: string) => {
  doGameLogin(token, account).then(res => {
    loginBtnLoading.value = false
    if (res.code === 1) {
      setMsg('启动成功', Type.Success)
      // router.go(0)
    } else {
      if (res.message === '人机验证失败') {
        captchaConfig.account = account
        window.captchaObj.showCaptcha();
        return
      }
      setMsg(res.message, Type.Warning)
    }
  })
}
// geetest
const captchaConfig = reactive({
  config: {
    captchaId: 'd8551513acc423d24401e9622cddd45c',
    product: 'bind'
  },
  account: '',
  handler: captchaHandler
});
function captchaHandler(obj: any) {
  window.captchaObj = obj;
  obj.appendTo('#captcha').onSuccess(() => {
    if (captchaConfig.config.product === 'bind') {
      const result: object = window.captchaObj.getValidate();
      if (!result) {
        setMsg('请完成验证', Type.Warning)
        return;
      }
      login(JSON.stringify(result), captchaConfig.account);
    }
  });
}
startSSE(user.value.Token)

// 账号配置面板
const selectGame = ref('')
const openGameConf = (game: ApiUser.Game) => {
  selectGame.value = show.value ? '' : game.status.account
  show.value = !show.value;
}
</script>
<style>
  div, img {
    user-select: none;
    -webkit-user-drag: none;
  }
</style>