<template>
  <a class="text-3xl mt-2 text-info font-bold">游戏登记托管</a>
  <div class="divider">账号信息</div>
  <div class="w-full mb-3">
    <div class="s-combo mb-6">
      <input class="s-input peer focus:ring-info" v-model="form.Account">
      <label class="s-label peer-focus:text-info">登录账号</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info" v-model="form.Password">
      <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
    </div>
  </div>
  <div class="divider my-4">服务器选择</div>
  <div class="w-full mb-3">
    <label class="label cursor-pointer">
      <span class="text-xl">BiliBili服</span>
      <input type="radio" :value="2" v-model="form.Platform" id="bili" class="radio checked:bg-blue-500" />
    </label>
    <label class="label cursor-pointer">
      <span class="text-xl">官服（安卓 / IOS）</span>
      <input type="radio" :value="1" v-model="form.Platform" id="official" class="radio checked:bg-red-500" />
    </label>
  </div>
  <div class="divider mt-0">必读内容</div>
  <div class="w-full">
    <div role="alert" class="rounded border-s-4 border-info bg-info/10 px-4 py-2 space-y-2">
      <p class="skd-title">我已阅读理解可露希尔每日生鲜
        <a href="/blog/Terms&Policies" target="_blank" class="s-underline">用户协议</a>、
        <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a>
      </p>
      <p class="skd-title">具有一定阅读理解能力，已阅读<a class="text-info" href="https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md">《提问的智慧》</a>，能基于此与本团队反馈问题</p>
    </div>
    {{ form }}
  </div>
  <div class="flex-1 mb-4" />
  <button class="btn btn-block btn-info disabled:text-base-content/90" :disabled="loading" @click="start">
    <span v-if="loading" class="loading loading-bars" />
    明日方舟，启动
  </button>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import {doAddGame} from "../../plugins/axios";
import {setMsg} from "../../plugins/common";
import {Type} from "../toast/enmu";

const loading = ref(false)
const form = ref({
  Account: '',
  Password: '',
  Platform: 1
})
const start = async () => {
  if (form.value.Account === '' || form.value.Password === '') {
    setMsg('请填写登录信息', Type.Warning)
    return;
  }
  window.grecaptcha?.ready(async () => {
    loading.value = true
    const token = await window.grecaptcha.execute('6LfrMU0mAAAAADoo9vRBTLwrt5mU0HvykuR3l8uN', {action: 'submit'})
    if (token === '') {
      setMsg('pirnt（\'图灵测试失败,请检查你的 Network")', Type.Warning)
      loading.value = false
      return;
    }
    setMsg('当前短信认证尚未开放，请勿尝试添加账号！', Type.Warning)
    return
    doAddGame(token, form.value).then(res => {
      loading.value = false
      if (res.code === 1) {
        setMsg('登记成功', Type.Success)
        // todo: 刷新页面
      } else {
        setMsg(res.message, Type.Warning)
      }
    })
  })
}
</script>