<template>
  <div class="bg-base-100 mx-4 p-6 shadow-lg max-w-xl rounded-lg">
    <div class="text-3xl text-info font-bold text-center">游戏登记托管</div>
    <div class="divider">账号信息</div>
    <div class="w-full mb-3">
      <div class="s-combo mb-6">
        <input class="s-input peer focus:ring-info" v-model="form.account">
        <label class="s-label peer-focus:text-info">登录账号</label>
      </div>
      <div class="s-combo">
        <input class="s-input peer focus:ring-info" v-model="form.password">
        <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
      </div>
    </div>
    <div class="divider my-4">服务器选择</div>
    <div class="w-full mb-3">
      <label class="label cursor-pointer">
        <span class="text-xl">BiliBili服</span>
        <input type="radio" :value="2" v-model="form.platform" id="bili" class="radio checked:bg-blue-500" />
      </label>
      <label class="label cursor-pointer">
        <span class="text-xl">官服(安卓 / IOS)</span>
        <input type="radio" :value="1" v-model="form.platform" id="official" class="radio checked:bg-red-500" />
      </label>
    </div>

    <div v-if="isFirst && confirmPhone === false">
      <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2">
        <p class="blog">
          您正在添加首个游戏账号，请确保该账号<b class="text-2xl">可接收验证码</b>且在 24 小时内提交以验证账号归属，否则您的平台通行证将被<b>冻结</b>。
        </p>
      </div>
      <div class="grid gap-4 grid-cols-3 mt-4">
        <label @click="handleDeclinePhoneBtnOnClick"
          class="btn btn-block btn-outline btn-error col-span-1 disabled:text-base-content/90">
          拒绝
        </label>
        <button class="btn btn-block btn-info col-span-2 disabled:text-base-content/90"
          @click="handleConfirmPhoneBtnOnClick">
          我确认该账号可接收验证码
        </button>
      </div>
    </div>
    <div v-if="confirmPhone">
      <div class="divider mt-0">必读内容</div>
      <div class="w-full">
        <div role="alert" class="rounded border-s-4 border-info bg-info/10 px-4 py-2 space-y-2">
          <p class="skd-title">我已阅读理解可露希尔每日生鲜
            <a href="/blog/Terms&Policies" target="_blank" class="s-underline">用户协议</a>、
            <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a>
          </p>
          <p class="skd-title">具有一定阅读理解能力，已阅读<a class="text-info"
              href="https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md">《提问的智慧》</a>，能基于此与本团队反馈问题
          </p>
        </div>
      </div>
      <div class="flex-1 mb-4" />
      <div class="grid gap-4 grid-cols-2 mt-2">
        <label @click="handleCloseBtnOnClick" class="btn btn-block btn-outline btn-error disabled:text-base-content/90">
          <span v-if="isLoading" class="loading loading-bars" />
          关闭
        </label>
        <button class="btn btn-block btn-info disabled:text-base-content/90" :disabled="isLoading"
          @click="handleCreateBtnOnClick">
          <span v-if="isLoading" class="loading loading-bars" />
          明日方舟，启动
        </button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { doAddGame } from "../../plugins/axios";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enum";
import updateCaptchaHandler from "../../plugins/geeTest/captcha";
import { DialogComponentProps } from "../../plugins/dialog/dialog";
import { checkIsMobile } from "../../utils/regex";
import { get } from "http";

interface Props extends DialogComponentProps {
  slotUUID: string
  isFirst: boolean
  loginFunc: (account: string) => Promise<void>
}
const props = defineProps<Props>();
const { dialogClose, slotUUID, isFirst, loginFunc } = props
const confirmPhone = ref(isFirst === undefined || isFirst ? false : true);
const isLoading = ref(false)

const form = ref<Registry.AddGameForm>({
  account: '',
  password: '',
  platform: 1
})


const createGame = async (token: string) => {
  const resp = await doAddGame(slotUUID, token, form.value)
  console.log(resp)
  if (resp.code === 1) {
    setMsg('账号托管提交成功', Type.Success)
    return;
  }
  if (resp.message) setMsg(resp.message, Type.Error)
  throw new Error(resp.message)
}

const handleCreateGameProcess = async () => {
  if (slotUUID === '') {
    setMsg('请刷新页面后重试', Type.Warning)
    throw new Error("slotUUID is empty")
  }
  if (form.value.account === '' || form.value.password === '') {
    setMsg('请填写登录信息', Type.Warning)
    throw new Error("account or password is empty")
  }
  // 如果是第一个账号，必须是手机号码格式
  if (isFirst) {
    const isMobileFormat = checkIsMobile(form.value.account)
    if (!isMobileFormat) {
      setMsg('请填写正确的手机号码', Type.Warning)
      throw new Error("account is not mobile format")
    }
  }
  setMsg('叠甲成功，提交托管信息中', Type.Success)
  // 先通过 recaptcha 加载失败的时候直接降级到 geeTest
  if (!window.grecaptcha) {
    await updateCaptchaHandler(geeTestCreateGameOnSuccess())
    return;
  }

  // 使用 Promise 包装 grecaptcha.ready 和 execute
  const token = await new Promise<string>((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', { action: 'submit' })
        .then((res) => resolve(res || "")); // 将 res 为空的情况处理成空字符串
    });
  });

  // 检查 token 是否为空
  if (token === "") {
    setMsg("图灵测试失败，请检查你的网络连接", Type.Warning);
    throw new Error("recaptcha token is empty");
  }

  // 直接调用 createGame，并等待执行完成
  await createGame(token);
}

const buildGameAccount = (account: string, platform: number) => {
  if (platform === 1) {
    return "G" + account
  }
  if (platform === 2) {
    return "B" + account
  }
  return account
}

const geeTestCreateGameOnSuccess = () => {
  return (geeTestToken: string) => {
    createGame(geeTestToken)
  }
}

const handleConfirmPhoneBtnOnClick = () => {
  confirmPhone.value = true
}

const handleDeclinePhoneBtnOnClick = () => {
  confirmPhone.value = false
  dialogClose()
}

const handleCreateBtnOnClick = async () => {
  // protect multiple click
  if (isLoading.value) return
  try {
    isLoading.value = true
    // createGame
    await handleCreateGameProcess()
    setMsg('创建账号成功。开始自动登录', Type.Success)
    // loginFunc()
    await loginFunc(buildGameAccount(form.value.account, form.value.platform))
    dialogClose()
  } catch (error) {
  } finally {
    isLoading.value = false
  }
}

const handleCloseBtnOnClick = () => {
  dialogClose()
}
</script>