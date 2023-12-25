<template>
    <dialog ref="BattleScreenShotsRef" class="modal" style="outline-width: 0">
        <div class="bg-base-100 mx-4 px-6 py-4 shadow-lg max-w-md rounded-lg blog">
            <h2>战斗截图记录</h2>
            <div class="divider divider-warning"></div>
            <div v-if="props.screenShots.length > 0 && props.screenShots[0].fileName">
                <div class="carousel w-full flex justify-center">
                    <div v-for="(fileName, index) in props.screenShots[0].fileName" :key="index"
                        class="carousel-item w-full flex justify-center">
                        <div v-show="!imageLoaded[index]" class="loading loading-bars loading-lg"></div>
                        <img :src="getBattleScreenShotsLink(props.screenShots[0].host, fileName)" class="w-full"
                            v-show="imageLoaded[index]" @load="onImageLoad(index)" />
                    </div>
                </div>
                <div class="flex justify-center w-full py-2 gap-2">
                    <a v-for="(fileName, index) in props.screenShots[0].fileName" :key="index" :href="'#item' + (index + 1)"
                        class="btn btn-outline btn-xs">{{ index + 1 }}</a>
                </div>
                <button @click="BattleScreenShotsRef.close()" class="btn btn-info btn-block mb-3">关闭</button>
            </div>
        </div>
    </dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { BattleScreenShotsRef } from './index';

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
const getBattleScreenShotsLink = (fileName: string, host: string) => {
    // return "https://objectstorage.ap-seoul-1.oraclecloud.com/n/cnhmkrjnefhf/b/screenshot/o/battle_fca7a2b1-43ca-7f55-0ea7-386a83258c0d_4753a871-de22-4aec-a82c-606cc23eaef5_5.webp";
    return host + fileName;
}

</script>
    