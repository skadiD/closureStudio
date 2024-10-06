<template>
  <div
    class="hover:scale-105 hover:shadow-lg hover:bg-info/10 active:bg-info/10 active:scale-95 duration-300 shadow-lg rounded-2xl px-4 py-3 s-pro">
    <div class="flex items-center">
      <div class="avatar mr-2">
        <div class="w-12 rounded-md">
          <img :src="`https://assets.ltsc.vip/avatar/${getAvatarType()}/${getAvatarId()}.png`" alt="斯卡蒂" />
        </div>
      </div>
      <div class="flex">
        <span class="text-4xl font-en">{{ getGameLevel() }}</span>
      </div>
      <div class="divider divider-horizontal mx-0 py-1" />
      <div class="flex flex-col text-base-content/60 font-bold">
        <span>Lv.</span>
        <span class="-mt-2">博士等级</span>
      </div>
      <div class="flex-1" />
      <div class="badge p-3 px-4 badge-info font-zhCN text-lg">
        {{ getGamePlatformStr() }}
      </div>
    </div>
    <div class="mt-1 text-2xl font-zhCN">
      Dr. {{ getGameNickName() }}
      <span class="text-lg text-info">【{{ getMaskedGameAccount() }}】</span>
    </div>
    <div class="grid grid-cols-3">
      <div class="flex flex-col" v-for="m in 3">
        <span class="text-base-content/70">{{ ["理智", "地图", "状态"][m - 1] }}
          <b class="text-info">//</b>
        </span>
        <span class="text-md font-bold font-en" v-html="getContent(m)"></span>
      </div>
    </div>
    <slot />

  </div>
</template>
<script lang="ts" setup>
import { assets } from "../../plugins/assets/assets";
import { maskPhoneNumber } from "../../plugins/common";
import { ref, onMounted, onUnmounted } from "vue";
interface Props {
  game?: ApiGame.Game;
}
const props = defineProps<Props>();
const { game } = props;


const getAvatarId = () => {
  if (!game) return "avatar_activity_GK";
  return game.status?.avatar.id || "avatar_activity_GK";
};
const getAvatarType = () => {
  if (!game) return "DEFAULT";
  return game.status?.avatar.type || "DEFAULT";
};

const getGameLevel = () => {
  if (!game) return 0;
  return game.status?.level || 0;
};

const getGamePlatformStr = () => {
  if (!game) return "未知";
  return game.status?.platform === 1 ? "官服" : "B服";
};

const getGameNickName = () => {
  if (!game) return "Nameless";
  return game.status?.nick_name || "Nameless";
};

const getMaskedGameAccount = () => {
  if (!game) return "未知账号";
  return maskPhoneNumber(game.game_config?.account);
};

const loadingIndex = ref<number | null>(null);

let interval: number;

onMounted(() => {
  interval = window.setInterval(() => {
    loadingIndex.value = Math.floor(Math.random() * 3) + 1; // 随机选择 1 到 3
    // 显示 1 秒后重置
    setTimeout(() => {
      loadingIndex.value = null;
    }, 1000);
  }, 3000);
});

onUnmounted(() => {
  clearInterval(interval);
});

const getContent = (m: number): string => {
  if (!game) return "未知";

  if (loadingIndex.value === m) {
    return '<span class="loading loading-bars loading-xs"></span>';
  }

  switch (m) {
    case 1:
      return game?.status?.ap?.toString() ?? "0";

    case 2:
      return assets.value.getStageName(game?.game_config?.map_id ?? "") || "未选择";

    case 3:
      return game?.status?.text ?? "未知";

    default:
      return "";
  }
};
</script>
