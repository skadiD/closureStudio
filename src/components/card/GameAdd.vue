<template>
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
      <span class="text-xl">官服（安卓 / IOS）</span>
      <input type="radio" :value="1" v-model="form.platform" id="official" class="radio checked:bg-red-500" />
    </label>
  </div>
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
    <label for="addModel" class="btn btn-block btn-outline btn-error disabled:text-base-content/90">
      <span v-if="loading" class="loading loading-bars" />
      关闭
    </label>
    <button class="btn btn-block btn-info disabled:text-base-content/90" :disabled="loading" @click="start">
      <span v-if="loading" class="loading loading-bars" />
      明日方舟，启动
    </button>
  </div>
  <input type="checkbox" id="confirmModel" class="modal-toggle" v-model="confirm"/>
  <div v-if="isFirst" class="modal" role="dialog">
    <div class="bg-base-100 mx-4 p-4 shadow-lg max-w-md rounded-lg">
      <div class="text-3xl text-warning font-bold text-center mt-2">温馨提示</div>
      <div class="divider" />
      <div role="alert" class="rounded border-s-4 border-warning bg-warning/10 p-4 space-y-2">
        <p class="blog">
          您正在添加首个游戏账号，请确保该账号<b class="text-2xl">可接收验证码</b>且在 24 小时内提交以验证账号归属，否则您的平台通行证将被<b>冻结</b>。
        </p>
      </div>
      <div class="s-combo mb-6 mt-4">
        <input class="s-input peer focus:ring-warning" v-model="confirmText">
        <label class="s-label peer-focus:text-warning">请输入【<b class="text-2xl">我确信我的手机号可收到验证码</b>】</label>
      </div>
      <button class="btn btn-block btn-warning" @click="confirmBtn">确认</button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { doAddGame } from "../../plugins/axios";
import { setMsg, sleep } from "../../plugins/common";
import { Type } from "../toast/enmu";
import updateCaptchaHandler from "../../plugins/geetest/captcha";

interface Props {
  uuid: string
  isFirst: boolean
}
const props = withDefaults(defineProps<Props>(), {
  uuid: '',
  isFirst: true,
});
const confirm = ref(false)
const confirmText = ref('')
const loading = ref(false)
const emit = defineEmits(['close'])
const form = ref<Registry.AddGameForm>({
  account: '',
  password: '',
  platform: 1
})
const confirmBtn = () => {
  if (confirmText.value === '我确信我的手机号可收到验证码') {
    confirm.value = false
    loading.value = false
    setMsg('叠甲成功，提交托管信息中', Type.Success)
    start()
  } else {
    setMsg('请输入正确的文本', Type.Warning)
  }
}

const addGame = (token: string) => {
  doAddGame(props.uuid, token, form.value).then((res: any) => {
    loading.value = false
    if (res.code === 0) { // 通过 geetest
      setMsg('请继续完成滑块验证', Type.Info)
      updateCaptchaHandler(geetestAddGameOnSuccess())
      return
    }
    if (res.code === 1) {
      setMsg('账号托管提交成功', Type.Success)
      emit('close')
    } else {
      setMsg(`账号托管失败，返回码：${res.code}`, Type.Warning);
      if (res.message) setMsg(res.message, Type.Warning)
      Object.values(res.data.results).forEach((value: any) => {
        if (value.available) return
        setMsg(`${value.ruleId}: ${value.message}`, Type.Info)
      })
    }
  })
}

const start = async () => {
  if (props.isFirst && confirmText.value == '') {
    confirm.value = true
    return
  }
  if (props.uuid === '') {
    setMsg('请刷新页面后重试', Type.Warning)
    return;
  }
  if (form.value.account === '' || form.value.password === '') {
    setMsg('请填写登录信息', Type.Warning)
    return;
  }
  loading.value = true
  // 先通过 recaptcha 加载失败的时候直接降级到 geetest
  if (!window.grecaptcha) {
    updateCaptchaHandler(geetestAddGameOnSuccess())
    return;
  }
  window.grecaptcha?.ready(async () => {
    const token = await window.grecaptcha.execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', { action: 'submit' })
    if (token === "") {
      setMsg("pirnt（'图灵测试エロ,请检查你的 Network\")", Type.Warning);
      loading.value = false;
      return;
    }
    addGame(token)
  })
}
const geetestAddGameOnSuccess = () => {
  return (geetestToken: string) => {
    addGame(geetestToken)
  }
}
</script>