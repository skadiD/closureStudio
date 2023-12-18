<template>
  <div
    class="hover:scale-105 hover:shadow-lg hover:bg-info/10 active:bg-info/10 active:scale-95 duration-300 shadow-lg rounded-2xl px-4 py-3 s-pro">
    <div class="flex items-center">
      <div class="avatar mr-2">
        <div class="w-12 rounded-md">
          <img :src="`https://assets.closure.setonink.com/dst/avatar/${game.status?.avatar.type || 'DEFAULT'
            }/${game.status?.avatar.id || 'avatar_activity_GK'}.webp`" alt="斯卡蒂" />
        </div>
      </div>
      <div class="flex">
        <span class="text-4xl font-en">{{ game.status?.level }}</span>
      </div>
      <div class="divider divider-horizontal mx-0 py-1" />
      <div class="flex flex-col text-base-content/60 font-bold">
        <span>Lv.</span>
        <span class="-mt-2">博士等级</span>
      </div>
      <div class="flex-1" />
      <div class="badge p-3 px-4 badge-info font-zhCN text-lg">
        {{ game.status?.platform === 1 ? "官" : "B" }}服
      </div>
    </div>
    <div class="mt-1 text-2xl font-zhCN">
      Dr. {{ game.status?.nick_name || "Nameless" }}
      <span class="text-lg text-info">【{{ game.game_config?.account }}】</span>
    </div>
    <div class="grid grid-cols-3">
      <div class="flex flex-col" v-for="m in 3">
        <span class="text-base-content/70">{{ ["理智", "地图", "状态"][m - 1] }}
          <b class="text-info">//</b>
        </span>
        <span class="text-md font-bold font-en">{{
          [
            game.status?.ap,
            assets.getStageName(game.game_config?.map_id) || "未选择",
            game.status?.text,
          ][m - 1]
        }}</span>
      </div>
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
import { assets } from "../../plugins/assets/assets";
interface Props {
  game: ApiUser.Game;
}
withDefaults(defineProps<Props>(), {
  game: () => {
    return {} as ApiUser.Game;
  },
});
</script>
