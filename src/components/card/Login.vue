<template>
  <dialog id="login" class="modal">
    <Docker />
    <div class="modal-box shadow-lg max-w-md rounded-lg py-8">
      <div v-if="isLogin" class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">用户登录</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="isLogin = !isLogin">没有账号？点击注册！</a>
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input class="s-input peer focus:ring-info" v-model="loginParams.email">
              <label class="s-label peer-focus:text-info">可露希尔通行证</label>
            </div>
            <div class="s-combo">
              <input class="s-input peer focus:ring-info" v-model="loginParams.password" type="password">
              <label class="s-label peer-focus:text-info">密码</label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">保存密码（请勿在公共设备上保存）</span>
                <input type="checkbox" class="checkbox checkbox-info" />
              </label>
            </div>
            <span class="text-base-content/40 text-center">登录&注册有问题？点击查看
              <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a></span>
            <a class="btn btn-block btn-info" @click="loginBtn">
              <span v-if="isLoading" class="loading loading-bars" />登录</a>
          </div>
        </div>
      </div>
      <div v-else class="s-login-box">
        <div class="text-center">
          <h1 class="block text-4xl font-bold text-info">通行证注册</h1>
        </div>
        <div class="mt-5">
          <a class="btn btn-block btn-info btn-outline" @click="isLogin = !isLogin">使用通行证登录</a>
          <div class="divider">OR</div>
          <div class="grid gap-y-4">
            <div class="s-combo">
              <input class="s-input peer focus:ring-info" v-model="regParams.email">
              <label class="s-label peer-focus:text-info">可露希尔通行证</label>
            </div>
            <div class="s-combo">
              <input class="s-input peer focus:ring-info" v-model="regParams.password" type="password">
              <label class="s-label peer-focus:text-info">密码</label>
            </div>

            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">我已阅读理解可露希尔小卖部
                  <a href="/blog/Terms&Policies" target="_blank" class="s-underline">用户协议</a>
                </span>
                <input type="checkbox" class="checkbox checkbox-info" />
              </label>
            </div>
            <span class="text-base-content/40 text-center">登录&注册有问题？点击查看
              <a href="/blog/FAQ" target="_blank" class="s-underline">常见问题</a></span>
            <a class="btn btn-block btn-info" @click="regBtn"><span v-if="isLoading"
                class="loading loading-bars" />注册</a>
          </div>
        </div>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { setMsg } from "../../plugins/common";
import { Type } from "../toast/enmu";
import Docker from "../toast/Docker.vue";
import { Auth_Login, Auth_Register } from "../../plugins/axios";
import { userStore } from "../../store/user";
import { useRouter } from "vue-router";
// @ts-ignore
const isLogin = ref(true)
const loginParams = ref({
  email: '',
  password: ''
})
const regParams = ref({
  email: '',
  password: '',
  noise: '',
  sign: ''
})
const user = userStore()
const router = useRouter()
const isLoading = ref(false)
const loginBtn = () => {
  if (isLoading.value) return
  isLoading.value = true
  Auth_Login(loginParams.value).then(res => {
    if (res.data) {
      setMsg('登录成功', Type.Success)
      user.login(res.data.token)
      router.push('/dashboard')
      return
    }
    setMsg(res.message, Type.Info)
  }).finally(() => {
    isLoading.value = false
  })
}
const regBtn = () => {
  if (isLoading.value) return
  isLoading.value = true
  // @ts-ignore
  regParams.value.noise = window.idaks?.join('')
  // @ts-ignore
  regParams.value.sign = window.skadi(regParams.value.email + "&" + regParams.value.password + "&" + regParams.value.noise)
  Auth_Register(regParams.value).then(res => {
    if (res.code === 0 || !res.data) {
      setMsg(res.message || '注册失败', Type.Warning)
      return;
    }
    setMsg('注册成功', Type.Success)
    user.login(res.data.token)
    router.push('/dashboard')
  }).finally(() => {
    isLoading.value = false
  })
}
</script>