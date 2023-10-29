<template>
  <a class="text-3xl mt-2 text-info font-bold">游戏登记托管</a>
  <div class="divider">账号信息</div>
  <div class="w-full mb-3">
    <div class="s-combo mb-6">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">登录账号</label>
    </div>
    <div class="s-combo">
      <input class="s-input peer focus:ring-info">
      <label class="s-label peer-focus:text-info">密码（请确认无误）</label>
    </div>
  </div>
  <div class="divider my-4">服务器选择</div>
  <div class="w-full mb-3">
    <label class="label cursor-pointer">
      <span class="text-xl">官服（安卓 / IOS）</span>
      <input type="radio" name="radio-10" class="radio checked:bg-red-500" checked />
    </label>
    <label class="label cursor-pointer">
      <span class="text-xl">BiliBili服</span>
      <input type="radio" name="radio-10" class="radio checked:bg-blue-500" checked />
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
  </div>
  <div class="flex-1 mb-4" />
  <a class="btn btn-block btn-info" @click="onSubmit">明日方舟，启动</a>
</template>
<script lang="ts" setup>
import { useChallengeV3  } from 'vue-recaptcha'
const { execute } = useChallengeV3('submit')

async function onSubmit () {
  const response = await execute()
  // do something with response
  alert(response)
  console.log(response)
}
</script>