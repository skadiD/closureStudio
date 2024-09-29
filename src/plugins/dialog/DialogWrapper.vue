<template>
    <input type="checkbox" class="modal-toggle" v-model="isCheck" />
    <div class="modal " role="dialog">
        <div ref="dialogContent" class="animate__animated">
            <component :is="component" v-bind="componentProps" :dialogClose="dialogClose" />
        </div>
    </div>
</template>



<script lang="ts" setup>
import { nextTick, onMounted, ref } from 'vue';
import "animate.css";
interface Props {
    component: any; // 传入的子组件
    dialogClose: () => void;
    componentProps: any; // 新增：接收传入的组件 props
}
const isCheck = ref(false);
const randomEffect = ["animate__bounce", "animate__flash", "animate__pulse", "animate__rubberBand", "animate__shakeX", "animate__shakeY", "animate__headShake", "animate__swing", "animate__tada", "animate__wobble", "animate__jello", "animate__heartBeat"];
const randomEffectIndex = Math.floor(Math.random() * randomEffect.length);
const dialogContent = ref<HTMLElement | null>(null);


withDefaults(defineProps<Props>(), {
    component: null,
    dialogClose: () => {},
    componentProps: {}
});


onMounted(async () => {
    await nextTick(); // 确保DOM已经更新
    isCheck.value = true;
    dialogContent.value?.classList.add(randomEffect[randomEffectIndex]); // 动态添加随机动画效果
})

</script>