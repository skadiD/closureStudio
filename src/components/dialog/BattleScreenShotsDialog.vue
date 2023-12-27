<template>
  <dialog id="BattleScreenShots" class="modal" style="outline-width: 0">
    <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
      <h2>战斗截图记录</h2>
      <div class="divider divider-warning"></div>
      <div v-if="props.screenShots.length > 0 && props.screenShots[0].fileName">
        <div class="carousel w-full flex justify-center">
          <div v-for="(fileName, index) in props.screenShots[0].fileName" :key="index"
               class="carousel-item w-full flex justify-center">
            <div v-show="!imageLoaded[index]" class="loading loading-bars loading-lg"></div>
            <img v-show="imageLoaded[index]" :src="getBattleScreenShotsLink(props.screenShots[0].host, fileName)"
                 class="w-full" @load="onImageLoad(index)"/>
          </div>
        </div>
        <div class="flex justify-center w-full py-4 gap-2">
          <a v-for="(_, index) in props.screenShots[0].fileName" :key="index" :href="'#item' + (index + 1)"
             class="btn btn-outline btn-xs">{{ index + 1 }}</a>
        </div>
        <button class="btn btn-error btn-outline btn-block mb-3" @click="dialogClose('BattleScreenShots')">关闭</button>
      </div>
    </div>
  </dialog>
</template>
<script lang="ts" setup>
import {ref} from 'vue';
import {dialogClose} from "./index";
interface Props {
  screenShots: ApiGame.Screenshot[];
}

const props = withDefaults(defineProps<Props>(), {
  screenShots: () => [],
});

const imageLoaded = ref(Array(props.screenShots.length).fill(false));
const onImageLoad = (index: number) => {
  imageLoaded.value[index] = true;
}
const getBattleScreenShotsLink = (host: string, fileName: string) => {
  return host + fileName;
}

</script>
    