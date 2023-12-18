<template>
  <div class="flex h-full">
    <div class="w-full flex-col max-w-4xl 2xl:max-w-6xl xl:mr-auto s-margin md:!flex"
      :class="show ? 'xl:ml-0 !hidden' : 'lg:ml-[calc((100vw-56rem)/2)] 2xl:ml-[calc((100vw-72rem)/2)]'">
      <div class="bg-base-300 shadow-lg rounded-lg px-4 py-1 blog relative">
        <div class="text-2xl md:text-4xl font-bold text-info mt-3">📢 今日特价</div>
        <p v-for="k in (config.announcement?.split('\n') || ['可露希尔逃跑了'])">{{ k }}</p>
        <div class="divider mt-0">个人信息</div>
        <p v-if="!userQuota?.idServerPhone && gameList?.length === 1">
          恭喜你添加了第一个账号！验证码将在托管启动成功后发送，你可以启动游戏体验<b>【{{ calc(gameList[0]?.status.created_at + 86400, now) }}】</b>。<br>
          完成【手机号：{{ gameList[0].status.account?.replace(/(\d{3})\d{6}(\d{2})/, '$1****$2') }}】绑定认证<b
            class="cursor-pointer" @click="realModel.showModal()">👉点我解锁👈</b>不限时游戏托管，并提升托管数量
        </p>
        <p v-if="!gameList?.length">
          你的账号没有完成
          <span class="text-info font-bold">【真实玩家认证】</span>，请先添加第一个游戏账号后完成绑定～(∠・ω&lt; )⌒★
        </p>
      </div>
      <IndexStatus />
      <div class="text-2xl font-bold">我的托管（{{ userQuota?.slots.filter(slot => slot.gameAccount !== null)?.length }} 已用 /
        {{ userQuota?.slots?.length }} 可用）</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div v-for="(slot, key) in userQuota?.slots" :key="key">
          <GameAddCard v-if="!slot.gameAccount" :slot="slot" :userInfo="userQuota" @click="addModel.showModal()" />
          <GameAccount v-else :game="getGameByAccount(slot.gameAccount)" @click="openGameConf(slot.gameAccount)">
            <div class="divider mt-2 mb-3 text-info font-arknigths text-xl">START</div>
            <div class="grid gap-4 grid-cols-2 mt-2">
              <button class="btn btn-outline btn-sm btn-block btn-primary"
                v-if="getGameByAccount(slot.gameAccount)?.status?.code != 0 && getGameByAccount(slot.gameAccount)?.status?.code != 1"
                @click="show = !show; suspend(slot.gameAccount)" :disabled="loginBtnLoading">暂停</button>
              <button class="btn btn-outline btn-sm btn-block btn-info" v-else
                @click="show = !show; gameLogin(slot.gameAccount)"
                :disabled="loginBtnLoading || getGameByAccount(slot.gameAccount)?.status?.code == 1">启动</button>
              <button class="btn btn-outline btn-sm btn-block btn-error" disabled>删除</button>
            </div>
          </GameAccount>
        </div>
      </div>
      <NetworkDialog />
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
    </div>
    <div
        class="bg-base-300 flex-1 flex flex-col md:ml-8 max-w-xl p-4 shadow-lg rounded-lg items-center animate__animated"
        v-show="show" :class="show ? 'animate__fadeInRight' : 'animate__fadeOutRight'">
      <GamePanel :account="selectGame" :statusCode="selectGameStatusCode" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from "vue";
import { config, gameList, startSSE } from "../../plugins/sse";
import 'animate.css';
import { userStore } from "../../store/user";
import { Auth_Refresh, Auth_Verify, doGameLogin, doUpdateGameConf, fetchUserSlots } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../../components/toast/enmu";
import { GameAccount, GamePanel, GameAddCard, GameAdd, IndexStatus } from "../../components/card/index"
import Geetest from "../../components/Geetest.vue";
import NetworkDialog from "../../components/dialog/NetworkDialog.vue";

const addModel = ref()
const realModel = ref()
// PC 侧边显示托管信息
const show = ref(false)
const user = userStore()
startSSE(user.Token)
const userQuota = ref<Registry.UserInfo>()

// 现在只有第一个账号
const slotUUID = ref('')
fetchUserSlots().then(res => {
  if (res.data) userQuota.value = res.data
  slotUUID.value = res.data?.slots.filter(
    slot => slot.gameAccount === null &&
    slot.ruleFlags.includes('slot_account_format_is_phone')
  )[0]?.uuid || ''
})
// 计算到期时间
const calc = (ts1: number, ts2: number) => {
  const during = ts1 - ts2;
  if (during <= 0) return '请先启动游戏托管';
  const hours = Math.floor(during / (60 * 60));
  const minutes = Math.abs(Math.floor((during % (60 * 60)) / 60));
  return `${hours}小时${minutes}分钟`;
}
const now = Math.round(Date.now() / 1000)
const loginBtnLoading = ref(false)
const gameLogin = (account: string) => {
  loginBtnLoading.value = true
  window.grecaptcha.ready(async () => {
    const token = await window.grecaptcha.execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', { action: 'submit' })
    if (token === '') {
      setMsg('pirnt（\'图灵测试エロ,请检查你的 Network")', Type.Warning)
      loginBtnLoading.value = false
      return;
    }
    login(token, account)
  })
}
const gameDel = (game: ApiUser.Game) => {
  loginBtnLoading.value = true
}

const getGameByAccount = (account: string) => {
  return gameList.value.find(game => game.status.account === account)
}

// 短信验证码
const smsCode = ref('')
const smsBtn = () => {
  if (smsCode.value !== '') {
    Auth_Verify(smsCode.value).then(res => {
      if (res.code === 1) {
        setMsg('认证成功', Type.Success)
        Auth_Refresh().then(res => {
          if (res.data) user.login(res.data.token)
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

const suspend = (account: string) => {
  loginBtnLoading.value = true
  const config: ApiGame.Config = {
    is_stopped: true,
  }
  doUpdateGameConf(account, config).then(res => {
    loginBtnLoading.value = false
    setMsg(res.message, Type.Info)
  })
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
    const result: object = window.captchaObj.getValidate();
    if (!result) {
      setMsg('请完成验证', Type.Warning)
      return;
    }
    login(JSON.stringify(result), captchaConfig.account);
  });
}

// 账号配置面板
const selectGame = ref('')
const selectGameStatusCode = ref(0)
const openGameConf = (account: string) => {
  const game = gameList.value.find(game => game.status.account === account)
  if (!game) return
  // 这些感觉可以再优化下
  selectGame.value = show.value ? '' : game.status.account
  selectGameStatusCode.value = game.status.code
  show.value = !show.value;
}
</script>
<style>
div,
img {
  user-select: none;
  -webkit-user-drag: none;
}
</style>