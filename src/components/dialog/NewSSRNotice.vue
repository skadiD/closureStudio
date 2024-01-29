<template>
  <dialog id="SSRNotice" class="modal" style="outline-width: 0">
    <div class="modal-box">
      <div class="text-3xl text-info font-bold text-center">可露希尔又双叒叕抽到6星干员啦</div>
      <div class="text-center font-bold my-2">在过去的 {{ ((Math.floor(Date.now() / 1000) - lastReadTs) / 3600).toFixed(2) }} 小时里，全站抽取到的干员是</div>
      <div class="w-full overflow-x-auto">
        <p v-if="!users.length" class="text-center text-4xl font-extrabold overflow-y-hidden text-warning h-12 mt-4">太神奇了！一个人都没有</p>
        <div v-else class="flex gap-2" :style="`width: ${(users.length) * 156}px`" >
          <div class="rounded shadow-md p-5 w-[148px] h-72 ssr relative" v-for="row in users"
               :style="`background-image:url('https://assets.closure.setonink.com/dst/charpor/${row.charId}_1.webp');`">
            <div class="absolute bottom-0 left-0 right-0 ">
              <div class="divider text-info font-extrabold text-shadow">{{ row.nickName }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="btn btn-block btn-info mt-4 text-3xl" @click="() => { dialogClose('SSRNotice') }">
        <span v-if="users.length">😎<span class="gradient-text">我一点都不羡慕</span>😎</span>
        <span v-else class="text-white">好好好</span>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.ssr {
  background-size: cover;
  background-repeat: no-repeat;
}
.text-shadow {
  text-shadow: 0 0 1rem #000, 0 0 0.875rem #000, 0 0 1rem #000, 0 0 0.875rem #000, 0 0 1rem #000, 0 0 0.875rem #000;
}
.divider:before, .divider:after {
  height: 0.1rem;
  background-color: var(--fallback-in,oklch(var(--in)/0.6));
}
.gradient-text {
  background: linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet);
  background-clip: text;
  color: transparent;
}
</style>
<script lang="ts" setup>
  import {dialogClose} from "./index";
  const lastReadTs = Number(localStorage.getItem('lastReadTs'))
  const now = Math.floor(Date.now() / 1000)
  localStorage.setItem('lastReadTs', now.toString())
  interface Props {
    users: ApiGame.SSR[]
  }
  withDefaults(defineProps<Props>(), {
    users: () => {
      return [];
    }
  })
</script>